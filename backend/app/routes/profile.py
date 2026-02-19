from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.schemas.profile import ProfileCreate, Profile
from app.supabase_client import supabase

router = APIRouter(prefix="/profiles", tags=["Profiles"])

# GET /profiles/
@router.get("/", response_model=list[Profile])
def list_profiles():
    result = supabase.table("profiles").select("*").execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to fetch profiles")
    return result.data

# POST /profiles/
@router.post("/", response_model=Profile)
def create_profile(profile: ProfileCreate):
    data = profile.dict()
    data["created_at"] = datetime.now(timezone.utc).isoformat()

    result = supabase.table("profiles").insert(data).execute()
    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=500, detail="Failed to create profile")

    return result.data[0]
