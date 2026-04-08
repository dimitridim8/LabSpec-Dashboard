from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SpecimenBase(BaseModel):
    org_id: Optional[str] = None
    specimen_code: Optional[str] = None
    specimen_type: Optional[str] = None
    current_status: str
    storage_condition: Optional[str] = None
    storage_location: Optional[str] = None

    patient_mrn: Optional[str] = None
    patient_name: Optional[str] = None
    patient_dob: Optional[str] = None
    collection_time: Optional[str] = None


class SpecimenCreate(SpecimenBase):
    org_id: str


class SpecimenUpdate(BaseModel):
    specimen_type: Optional[str] = None
    current_status: Optional[str] = None
    storage_condition: Optional[str] = None
    storage_location: Optional[str] = None

    patient_mrn: Optional[str] = None
    patient_name: Optional[str] = None
    patient_dob: Optional[str] = None
    collection_time: Optional[str] = None


class Specimen(SpecimenBase):
    specimen_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
