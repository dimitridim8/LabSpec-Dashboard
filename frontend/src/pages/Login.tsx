import { useState } from "react";
import { supabase } from "../supabaseClient";
import beaker from '../assets/images/blue-beaker-image.png';

interface LoginProps {
  onNavigate?: (page: "home" | "login" | "register") => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full bg-white shadow-2xl border-none space-y-4 text-center pb-8 flex justify-center">
      <div className="" style={{display: "flex", justifyContent: "center"}}>
        <img src={beaker} alt="Beaker Icon" className="mb-6" style={{ width: 80, height: 60, opacity: 0.9}} />
      </div>
      <br></br>
      <br></br>
      <h1 className ="text-2xl" style={{ fontSize: "2.3rem", marginBottom: "2rem", display: "flex", justifyContent: "center", fontFamily: "Serif" }}>
        Welcome Back
      </h1>
      <h2 className="text-base mt-2 text-secondary" style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "#2c5282:", display: "flex", justifyContent: "center", padding: "2px", fontFamily: "Trebuchet MS" }}>
        Log in to your Labspec Dashboard account
      </h2>
      <br></br>
      <form onSubmit={onSubmit}>
        <div className="space-y-2 justify-start text-left">
        <label htmlFor="email" style={{ display: 'block', textAlign: 'left', marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>Email Address</label>
        <input
          placeholder="microbiologist@ufl.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, backgroundColor: "white", color: "black", borderRadius: 12, border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
        />
        </div>

        <label htmlFor="password" style={{ display: 'block', textAlign: 'left', marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>Password</label>
        <input
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, backgroundColor: "white", color: "black", borderRadius: 12, border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
        />
        <br></br>
        <br></br>
        <br></br>
        <button disabled={loading} style={{ width: "100%", padding: 10, backgroundColor: "#2c5282", borderRadius: 12}}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>
      <button
        onClick={() => onNavigate && onNavigate("home")}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          color: "#2c5282",
          cursor: "pointer",
          fontSize: "0.95rem"
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}