from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class RawClaimSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    source: str
    raw_data: Any

class ProcessedClaimSchema(BaseModel):
    title: str
    eligibility: str
    reward: str
    deadline: str  # YYYY-MM-DD
    category: str
    source: str
    processed_at: Optional[str] = None
