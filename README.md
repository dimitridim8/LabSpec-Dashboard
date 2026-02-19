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

# upgrade pip
python -m pip install --upgrade pip

# install backend dependencies
pip install -r requirements.txt

# install supabase client (if not already included)
pip install supabase

# create backend environment variables
# (create backend/.env manually with the following contents)
# SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# SUPABASE_KEY=YOUR_SUPABASE_KEY

# run the backend server
uvicorn app.main:app --reload --port 8000

# go to frontend folder
cd frontend

# install frontend dependencies
npm install

# start the frontend dev server
npm run dev

