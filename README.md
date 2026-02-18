# LabSpec Dashboard — Full Local Setup (One Command Flow)

This project contains:
- Backend: FastAPI + Supabase
- Frontend: React (Vite)

---

## Backend + Frontend Local Setup (Copy/Paste)

### Terminal 1 — Backend Setup + Run

```bash
# go to backend folder
cd backend

# install supabase client (if not included)
pip install supabase

# Supabase credentials located in .env in Backend directory

# run the backend server
uvicorn app.main:app --reload --port 8000

# go to frontend folder
cd frontend

# install frontend dependencies
npm install

# start the frontend dev server
npm run dev

