import { useState } from "react";
import { supabase } from "../supabaseClient";
import beaker from '../assets/images/blue-beaker-image.png';
type RegisterProps = {
  onSuccess: () => void; // <-- tells App to switch back to Login view
};

export default function Register({ onSuccess }: RegisterProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("lab_tech");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    // 1) Create Auth user
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      setErr(error.message);
      return;
    }

    // 2) If Supabase returns a user id, create profile row
    const userId = data.user?.id;
    if (userId) {
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: userId,
        name,
        role,
        email,
      });

      if (profileErr) {
        setLoading(false);
        setErr(profileErr.message);
        return;
      }
    }

    // 3) IMPORTANT: prevent auto-login (when email confirmation is OFF)
    await supabase.auth.signOut();

    setLoading(false);

    alert(
      userId
        ? "Registration successful. Please log in."
        : "Registration created. Please check your email to confirm, then log in."
    );

    // 4) Route back to Login view
    onSuccess();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 w-full max-w-md bg-white shadow-2xl border-none space-y-4 text-center pb-8 flex justify-center">
      <div className="" style={{display: "flex", justifyContent: "center"}}>
        <img src={beaker} alt="Beaker Icon" className="mb-6" style={{ width: 80, height: 60, opacity: 0.9}} />
      </div>
      <br></br>
      <br></br>
      <h1 className ="text-2xl" style={{ fontSize: "2.3rem", marginBottom: "2rem", display: "flex", justifyContent: "center", fontFamily: "Serif" }}>
        Create an Account
      </h1>
      <h2 className="text-base mt-2 text-secondary" style={{ fontSize: "1rem", marginBottom: "1.5rem", color: "#2c5282:", display: "flex", justifyContent: "center", padding: "2px", fontFamily: "Trebuchet MS" }}>
        Start tracking specimens with LabSpec Dashboard
        </h2>
      <form onSubmit={onSubmit}>
        <div className="space-y-2 justify-start text-left">
        <label htmlFor="name" style={{ display: 'block', textAlign: 'left', marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>Full Name</label>
        <input
          id="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, backgroundColor: "white", color: "black", borderRadius: 12, border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
        />
        </div>
        <label htmlFor="role" style={{ display: 'block', textAlign: 'left', marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>Role</label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, backgroundColor: "white", color: "black", borderRadius: 12, border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
        >
          <option value="lab_tech">Lab Tech</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
        </select>

        <label htmlFor="email" style={{ display: 'block', textAlign: 'left', marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>Email Address</label>
        <input
          id="email"
          placeholder="microbiologist@ufl.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, backgroundColor: "white", color: "black", borderRadius: 12, border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
        />
        <label htmlFor="password" style={{ display: 'block', textAlign: 'left', marginBottom: '0.25rem', fontWeight: '500', color: '#374151' }}>Password</label>
        <input
          id="password"
          placeholder="Create a strong password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10, backgroundColor: "white", color: "black", borderRadius: 12, border: "1px solid #ddd", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}
        />
        <br></br>
        <br></br>
        <button disabled={loading} style={{ width: "100%", padding: 10, backgroundColor: "#2c5282", borderRadius: 12}}>
          {loading ? "Creating..." : "Register"}
        </button>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>
      
    </div>
  );
}