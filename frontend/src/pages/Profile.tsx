import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import TopNav from "../components/TopNav";

type ProfileProps = {
  userId: string;
  fallbackEmail?: string;
  activePage: "profile";
  onNavigate: (page: "dashboard" | "profile" | "help") => void;
};

type ProfileData = {
  name: string;
  email: string;
  role: string;
};

const Profile: React.FC<ProfileProps> = ({ userId, fallbackEmail, onNavigate }) => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setError("Failed to load profile.");
        setLoading(false);
        return;
      }

      setProfile({
        name: data?.name ?? "",
        email: data?.email ?? "",
        role: data?.role ?? "",
      });

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ name: profile.name })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update profile:", error.message);
      setError("Failed to save profile changes.");
      setSaving(false);
      return;
    }

    setMessage("Profile updated successfully.");
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);

    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwSaving(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("Password update error:", error.message);
      setPwError(error.message || "Failed to update password.");
      setPwSaving(false);
      return;
    }

    setPwMessage("Password updated successfully.");
    setNewPassword("");
    setConfirmPassword("");
    setPwSaving(false);
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#c9d7e0" }}>
      <TopNav
        title="Profile"
        userId={userId}
        fallbackEmail={fallbackEmail ?? profile.email}
        activePage="profile"
        onNavigate={onNavigate}
      />
      <div className="container py-5">
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 700, borderRadius: 14 }}>
          <div className="card-body p-4">
            <h2 className="mb-4" style={{ color: "#2c5282", fontWeight: "bold" }}>
              My Profile
            </h2>

            {loading ? (
              <p>Loading profile...</p>
            ) : (
              <>
                {/* PROFILE INFO */}
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={profile.email}
                      disabled
                    />
                    <div className="form-text">Email cannot be changed here.</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Role</label>
                    <input
                      type="text"
                      name="role"
                      className="form-control"
                      value={profile.role}
                      disabled
                    />
                    <div className="form-text">Role is currently read-only.</div>
                  </div>

                  {message && <div className="alert alert-success">{message}</div>}
                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                      style={{ backgroundColor: "#2c5282", borderColor: "#2c5282" }}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => onNavigate("dashboard")}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                <hr className="my-4" />

                {/* CHANGE PASSWORD */}
                <h5 className="mb-3" style={{ color: "#2c5282", fontWeight: "bold" }}>
                  Change Password
                </h5>

                <form onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter a new password"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter the new password"
                    />
                  </div>

                  {pwMessage && <div className="alert alert-success">{pwMessage}</div>}
                  {pwError && <div className="alert alert-danger">{pwError}</div>}

                  <button
                    type="submit"
                    className="btn btn-outline-primary"
                    disabled={pwSaving}
                    style={{ borderColor: "#2c5282", color: "#2c5282" }}
                  >
                    {pwSaving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;