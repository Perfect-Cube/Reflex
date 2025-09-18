# models/tables.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Interview(Base):
    # ... (no changes to this model)
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, index=True)
    status = Column(String, default="started")
    warnings = Column(Integer, default=0)
    messages = relationship("Message", back_populates="interview")
    report = relationship("Report", uselist=False, back_populates="interview")
    feedback = relationship("AgentFeedback", back_populates="interview")


class Message(Base):
    # ... (no changes to this model)
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    sender = Column(String)
    text = Column(Text)
    interview = relationship("Interview", back_populates="messages")


class Report(Base):
    # ... (no changes to this model)
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), unique=True)
    score = Column(Integer)
    summary = Column(Text)
    strengths = Column(Text)
    weaknesses = Column(Text)
    interview = relationship("Interview", back_populates="report")


# --- NEW MODEL ---
class AgentFeedback(Base):
    __tablename__ = "agent_feedback"
    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    feedback_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    interview = relationship("Interview", back_populates="feedback")