from pydantic import BaseModel
from datetime import datetime

class ProfileBase(BaseModel):
    name: str
    role: str
    email: str

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
