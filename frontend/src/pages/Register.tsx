import { useState } from "react";
import { supabase } from "../supabaseClient";

type RegisterProps = {
  onSuccess: () => void;
};

export default function Register({ onSuccess }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      setErr(error.message);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: profileErr } = await supabase.from("profiles").insert({
        id: userId,
        name,
        email,
        role: "lab_tech",
        is_primary_admin: false,
        membership_status: "pending",
        org_id: null,
      });

      if (profileErr) {
        setLoading(false);
        setErr(profileErr.message);
        return;
      }
    }

    setLoading(false);
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
