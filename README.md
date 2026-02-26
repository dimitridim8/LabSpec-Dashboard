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
```

### Terminal 2 — Frontend Setup + Run

```bash
# go to frontend folder
cd frontend

# create frontend environment variables
# (create frontend/.env manually with the following contents)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_API_URL=http://localhost:8000

# install frontend dependencies
npm install
npm install @supabase/supabase-js

# start the frontend dev server
npm run dev

