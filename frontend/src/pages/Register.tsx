import { useState } from "react";
import { supabase } from "../supabaseClient";

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
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Create Account</h2>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          <option value="lab_tech">Lab Tech</option>
          <option value="admin">Admin</option>
          <option value="doctor">Doctor</option>
        </select>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />
        <button disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Creating..." : "Register"}
        </button>
        {err && <p style={{ color: "crimson" }}>{err}</p>}
      </form>
    </div>
  );
}