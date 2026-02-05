from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SpecimenBase(BaseModel):
    specimen_code: str
    specimen_type: str
    current_status: str
    storage_condition: str
    storage_location: str

class SpecimenCreate(SpecimenBase):
    pass

class Specimen(SpecimenBase):
    specimen_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
