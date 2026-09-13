from pydantic import BaseModel


class IdentifyResponse(BaseModel):
    familyMemberId: str | None
    confidence: float
