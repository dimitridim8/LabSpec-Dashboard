from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SpecimenBase(BaseModel):
    specimen_code: str
    specimen_type: str
    current_status: str
    storage_condition: Optional[str] = None
    storage_location: Optional[str] = None

class SpecimenCreate(SpecimenBase):
    pass

class SpecimenUpdate(BaseModel):
    current_status: Optional[str] = None
    storage_condition: Optional[str] = None
    storage_location: Optional[str] = None

class Specimen(SpecimenBase):
    specimen_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
