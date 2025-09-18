from pydantic import BaseModel
from typing import List, Optional

# --- Base Schemas for ORM models ---
# These define the basic fields for creating or reading data.

class MessageBase(BaseModel):
    sender: str
    text: str

class Message(MessageBase):
    id: int
    interview_id: int

    class Config:
        from_attributes = True # Pydantic v2 alias for orm_mode

class ReportBase(BaseModel):
    score: Optional[int] = None
    summary: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None

class Report(ReportBase):
    id: int
    interview_id: int

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    candidate_name: str

class Interview(InterviewBase):
    id: int
    status: str
    warnings: int
    messages: List[Message] = []
    report: Optional[Report] = None

    class Config:
        from_attributes = True


# --- API Endpoint Specific Schemas ---
# These define the exact shape of request bodies and responses for our endpoints.

# For POST /interview/start
class InterviewStartRequest(BaseModel):
    candidate_name: str

class InterviewStartResponse(BaseModel):
    interviewId: int
    message: str

# For POST /interview/{interview_id}/chat
class ChatMessageRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    message: str
    isTerminated: bool

# For POST /feedback
class FeedbackCreate(BaseModel):
    interview_id: int
    feedback_text: str

class FeedbackResponse(BaseModel):
    status: str
    message: str

# For POST /simulation/run
class SimulationMessage(BaseModel):
    sender: str
    text: str

class SimulationResponse(BaseModel):
    transcript: List[SimulationMessage]