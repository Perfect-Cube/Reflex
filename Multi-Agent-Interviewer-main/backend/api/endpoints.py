import json
import asyncio
import random
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.caching import redis_client
from services import interview_service
from agents.proctoring_agent import ProctoringAgent
from models import schemas, tables
from agents.interview_autogen import AgentOrchestrator

# Initialize the FastAPI router
router = APIRouter()

# --- HTTP Routes for Interview Flow, Data Retrieval, and Agent Management ---

@router.post("/interview/start", response_model=schemas.InterviewStartResponse)
def start_interview(request: schemas.InterviewStartRequest, db: Session = Depends(get_db)):
    """Starts a new interview session and returns the first AI message."""
    interview_id, first_message = interview_service.start_new_interview(
        db=db, candidate_name=request.candidate_name
    )
    return {"interviewId": interview_id, "message": first_message}


@router.post("/interview/{interview_id}/chat", response_model=schemas.ChatMessageResponse)
def chat(interview_id: int, request: schemas.ChatMessageRequest, db: Session = Depends(get_db)):
    """Handles a single turn in the conversation and triggers report generation on completion."""
    ai_response, is_terminated = interview_service.process_and_save_message(
        db=db, interview_id=interview_id, user_message=request.message
    )
    if is_terminated:
        print(f"Interview {interview_id} concluded. Generating report in the background...")
        # In a production app, this would be a background task (e.g., using Celery)
        interview_service.create_and_save_report(db, interview_id)
    return {"message": ai_response, "isTerminated": is_terminated}


@router.get("/interviews", response_model=List[schemas.Interview])
def get_all_interviews(db: Session = Depends(get_db)):
    """Retrieves all interviews for the admin dashboard, newest first."""
    interviews = db.query(tables.Interview).order_by(tables.Interview.id.desc()).all()
    return interviews


@router.get("/interview/{interview_id}/transcript", response_model=List[schemas.Message])
def get_transcript(interview_id: int, db: Session = Depends(get_db)):
    """Retrieves the full chat history for a single interview."""
    messages = db.query(tables.Message).filter(tables.Message.interview_id == interview_id).order_by(tables.Message.id).all()
    if not messages:
        raise HTTPException(status_code=404, detail="Interview not found or has no messages.")
    return messages


@router.get("/report/{interview_id}", response_model=schemas.Report)
def get_report(interview_id: int, db: Session = Depends(get_db)):
    """
    Retrieves the generated report for an interview, using a cache-aside strategy.
    If the report doesn't exist for a finished interview, it attempts to generate it on-demand.
    """
    if redis_client:
        cached_report = redis_client.get(f"report:{interview_id}")
        if cached_report:
            return json.loads(cached_report)

    report = db.query(tables.Report).filter(tables.Report.interview_id == interview_id).first()
    if report:
        if redis_client:
            # Use Pydantic's .json() method for proper serialization
            redis_client.set(f"report:{interview_id}", schemas.Report.from_orm(report).json(), ex=3600)
        return report

    # If report is not found, check if we should generate it
    interview = db.query(tables.Interview).filter(tables.Interview.id == interview_id).first()
    if interview and interview.status in ["completed", "terminated"]:
        print(f"Report for interview {interview_id} not found. Generating on-demand...")
        new_report = interview_service.create_and_save_report(db, interview_id)
        if new_report:
            if redis_client:
                redis_client.set(f"report:{interview_id}", schemas.Report.from_orm(new_report).json(), ex=3600)
            return new_report

    raise HTTPException(status_code=404, detail="Report not found or interview is not yet complete.")


@router.post("/feedback", response_model=schemas.FeedbackResponse)
def submit_feedback(request: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    """Receives and processes admin feedback to improve the agent."""
    result = interview_service.save_and_process_feedback(
        db=db, interview_id=request.interview_id, feedback_text=request.feedback_text
    )
    return result


@router.post("/simulation/run")
def run_simulation_placeholder():
    """This POST endpoint is deprecated. The frontend now uses the WebSocket for simulations."""
    return {"message": "Please connect to the WebSocket endpoint /ws/simulation for real-time results."}


# --- WebSockets for Real-time Communication ---

@router.websocket("/ws/proctoring/{interview_id}")
async def websocket_proctoring(websocket: WebSocket, interview_id: int, db: Session = Depends(get_db)):
    """Handles the real-time proctoring connection with the more lenient agent."""
    await websocket.accept()
    proctor = ProctoringAgent(session_id=interview_id)
    
    interview = db.query(tables.Interview).filter(tables.Interview.id == interview_id).first()
    if not interview:
        await websocket.close(code=1011, reason="Interview session not found.")
        return
    
    warnings = interview.warnings
    try:
        while True:
            frame_bytes = await websocket.receive_bytes()
            anomaly = await proctor.process_frame(frame_bytes)
            
            if anomaly:
                warnings += 1
                interview.warnings = warnings
                db.commit()
                
                await websocket.send_json({"type": "warning", "message": anomaly, "count": warnings})
                
                if warnings >= 3:
                    await websocket.send_json({"type": "terminate", "message": "Interview terminated due to multiple warnings."})
                    interview.status = "terminated"
                    db.commit()
                    break
    except WebSocketDisconnect:
        print(f"Proctoring WebSocket disconnected for interview {interview_id}")
    except Exception as e:
        print(f"An error occurred in the proctoring websocket: {e}")
    finally:
        await websocket.close()


@router.websocket("/ws/simulation")
async def websocket_simulation(websocket: WebSocket):
    """
    Handles a real-time simulation by running the full simulation first,
    then streaming the results back to the client turn-by-turn with realistic delays.
    This approach is more robust and prevents common asyncio errors.
    """
    await websocket.accept()
    orchestrator = AgentOrchestrator()
    
    try:
        # Step 1: Run the full simulation on the backend to get the complete transcript.
        # This is very fast with Groq and avoids complex state management.
        full_transcript = orchestrator.run_simulation()

        # Step 2: Stream the results back to the frontend with realistic, randomized delays.
        for message in full_transcript:
            is_candidate = "Candidate" in message["sender"]
            # Simulate candidate "thinking time" (longer delay) vs. AI's quick response.
            delay = random.uniform(2.5, 4.5) if is_candidate else random.uniform(1.5, 2.5)
            await asyncio.sleep(delay)
            
            # Send the message for the current turn to the frontend.
            await websocket.send_json({
                "type": "turn",
                "data": {"sender": message["sender"].replace('_Agent', ''), "text": message["text"]}
            })

        # Step 3: Send a final completion message.
        await asyncio.sleep(1)
        await websocket.send_json({"type": "complete", "message": "Simulation finished."})

    except Exception as e:
        print(f"An error occurred during simulation: {e}")
        # Send a clear error message to the client if something goes wrong.
        await websocket.send_json({"type": "error", "message": "An unexpected error occurred during the simulation."})
    finally:
        # Ensure the connection is always closed gracefully.
        await websocket.close()