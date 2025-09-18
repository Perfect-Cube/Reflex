# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY_INTERVIEWER: str
    GROQ_API_KEY_EVALUATOR: str
    GROQ_API_KEY_SIMULATOR: str
    REDIS_HOST: str
    REDIS_PORT: int
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()