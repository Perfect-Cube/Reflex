import json
from sqlalchemy.orm import Session
from models import tables
from agents.interview_autogen import AgentOrchestrator

def start_new_interview(db: Session, candidate_name: str):
    """
    Initializes a new interview.
    - Implements RAG by fetching recent feedback to provide context to the agent.
    - Creates the interview record in the database.
    - Generates and saves the initial AI welcome message.
    """
    # RAG: Get recent feedback to improve the agent's performance for this new interview.
    feedback_records = db.query(tables.AgentFeedback).order_by(tables.AgentFeedback.created_at.desc()).limit(5).all()
    past_feedback = "\n- ".join([f.feedback_text for f in feedback_records])

    # Create the interview record in the database
    new_interview = tables.Interview(candidate_name=candidate_name)
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    # Initialize the orchestrator with the historical context
    orchestrator = AgentOrchestrator(past_feedback=past_feedback)
    
    # Get only the first message to start the conversation
    first_message_text = orchestrator.get_initial_message(candidate_name)
    
    # Save the AI's first message to the database
    db.add(tables.Message(interview_id=new_interview.id, sender='ai', text=first_message_text))
    db.commit()
    
    return new_interview.id, first_message_text

def process_and_save_message(db: Session, interview_id: int, user_message: str):
    """
    Processes one turn of the conversation.
    - Saves the user's message.
    - Retrieves the full conversation history to maintain state.
    - Generates the next AI reply based on that history.
    - Saves the AI's response.
    - Handles interview termination.
    """
    # 1. Save the user's message to the database
    db.add(tables.Message(interview_id=interview_id, sender='user', text=user_message))
    db.commit()
    
    # 2. Retrieve the full conversation history from the database (our source of truth)
    db_messages = db.query(tables.Message).filter(tables.Message.interview_id == interview_id).order_by(tables.Message.id).all()
    
    # 3. Format the history into the OpenAI message format that the agent expects
    chat_history = []
    for msg in db_messages:
        role = "assistant" if msg.sender == 'ai' else "user"
        chat_history.append({"role": role, "content": msg.text})

    # 4. Generate the next AI reply using the full context
    orchestrator = AgentOrchestrator()
    ai_response_text = orchestrator.get_ai_reply(chat_history)

    # 5. Save the new AI response to the database
    db.add(tables.Message(interview_id=interview_id, sender='ai', text=ai_response_text))
    db.commit()

    # 6. Check for the termination keyword
    is_terminated = "TERMINATE" in ai_response_text.upper()
    if is_terminated:
        interview = db.query(tables.Interview).filter(tables.Interview.id == interview_id).first()
        if interview:
            interview.status = "completed"
            db.commit()

    return ai_response_text, is_terminated

def create_and_save_report(db: Session, interview_id: int):
    """Generates and saves the final performance report using the Evaluation Agent."""
    interview = db.query(tables.Interview).filter(tables.Interview.id == interview_id).first()
    if not interview or interview.report:
        return None 
        
    messages = db.query(tables.Message).filter(tables.Message.interview_id == interview_id).all()
    transcript = "\n".join([f"{msg.sender.capitalize()}: {msg.text}" for msg in messages])
    
    orchestrator = AgentOrchestrator()
    report_json_str = orchestrator.generate_report(transcript)
    
    try:
        report_data = json.loads(report_json_str)
        new_report = tables.Report(
            interview_id=interview_id,
            score=report_data.get("score"),
            summary=report_data.get("summary"),
            strengths=report_data.get("strengths"),
            weaknesses=report_data.get("weaknesses"),
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report
    except (json.JSONDecodeError, TypeError) as e:
        print(f"Error decoding report JSON for interview {interview_id}: {e}")
        return None

def save_and_process_feedback(db: Session, interview_id: int, feedback_text: str):
    """Saves admin feedback and uses the Feedback Agent to generate an actionable suggestion."""
    new_feedback = tables.AgentFeedback(interview_id=interview_id, feedback_text=feedback_text)
    db.add(new_feedback)
    db.commit()

    messages = db.query(tables.Message).filter(tables.Message.interview_id == interview_id).all()
    transcript = "\n".join([f"{msg.sender.capitalize()}: {msg.text}" for msg in messages])
    
    orchestrator = AgentOrchestrator()
    suggestion = orchestrator.process_feedback(transcript, feedback_text)
    
    print("\n" + "---" * 20)
    print(f"FEEDBACK ANALYSIS FOR INTERVIEW {interview_id}")
    print(f"Admin Feedback: {feedback_text}")
    print(f"AI Suggestion for Improvement: {suggestion}")
    print("---" * 20 + "\n")
    
    return {"status": "success", "message": "Feedback processed and logged for agent improvement."}

def run_simulation_service():
    """Runs a full, automated interview simulation."""
    orchestrator = AgentOrchestrator()
    transcript = orchestrator.run_simulation()
    return {"transcript": transcript}