import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import TopNav from "../components/TopNav";

type UserRole = "admin" | "lab_tech";

type ProfileProps = {
  userId: string;
  fallbackEmail?: string;
  activePage: "profile";
  onNavigate: (page: "dashboard" | "profile" | "help") => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
};

type ProfileData = {
  name: string;
  email: string;
  role: string;
  is_primary_admin: boolean;
  org_id: string | null;
  org_name: string | null;
};

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  membership_status: string;
};

const Profile: React.FC<ProfileProps> = ({
  userId,
  fallbackEmail,
  activePage,
  onNavigate,
  userRole,
  setUserRole,
}) => {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    role: "",
    is_primary_admin: false,
    org_id: null,
    org_name: null,
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

  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleSaveMessage, setRoleSaveMessage] = useState<string | null>(null);
  const [roleSaveError, setRoleSaveError] = useState<string | null>(null);
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null);
  const [approvingFor, setApprovingFor] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, role, is_primary_admin, org_id, organizations(name)")
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
        is_primary_admin: data?.is_primary_admin ?? false,
        org_id: data?.org_id ?? null,
        org_name: (data?.organizations as any)?.name ?? null,
      });

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  const fetchManagedUsers = async () => {
    if (userRole !== "admin" || !profile.org_id) return;

    setUsersLoading(true);
    setRoleSaveError(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, membership_status")
      .eq("org_id", profile.org_id)
      .order("email", { ascending: true });

    if (error) {
      console.error("Failed to fetch users:", error.message);
      setRoleSaveError("Failed to load users.");
      setUsersLoading(false);
      return;
    }

    const normalizedUsers: ManagedUser[] = (data || []).map((user) => ({
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role === "admin" ? "admin" : "lab_tech",
      membership_status: user.membership_status ?? "active",
    }));

    setManagedUsers(normalizedUsers);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (userRole === "admin" && profile.org_id) {
      fetchManagedUsers();
    }
  }, [userRole, profile.org_id]);

  const handleManagedRoleChange = (targetUserId: string, newRole: UserRole) => {
    setManagedUsers((prev) =>
      prev.map((user) =>
        user.id === targetUserId ? { ...user, role: newRole } : user
      )
    );
    setRoleSaveMessage(null);
    setRoleSaveError(null);
  };

  const handleSaveManagedRole = async (targetUserId: string, newRole: UserRole) => {
    setSavingRoleFor(targetUserId);
    setRoleSaveMessage(null);
    setRoleSaveError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", targetUserId);

    if (error) {
      console.error("Failed to update role:", error.message);
      setRoleSaveError("Failed to update user role.");
      setSavingRoleFor(null);
      return;
    }

    if (targetUserId === userId) {
      setUserRole(newRole);
      onNavigate("profile");
    }

    setRoleSaveMessage("User role updated successfully.");
    setSavingRoleFor(null);
    fetchManagedUsers();
  };

  const handleApprove = async (targetUserId: string) => {
    setApprovingFor(targetUserId);
    setRoleSaveMessage(null);
    setRoleSaveError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ membership_status: "active" })
      .eq("id", targetUserId);

    if (error) {
      setRoleSaveError("Failed to approve user.");
      setApprovingFor(null);
      return;
    }

    setRoleSaveMessage("User approved successfully.");
    setApprovingFor(null);
    fetchManagedUsers();
  };

  const handleReject = async (targetUserId: string) => {
    setApprovingFor(targetUserId);
    setRoleSaveMessage(null);
    setRoleSaveError(null);

    const { error } = await supabase
      .from("profiles")
      .update({ membership_status: "rejected" })
      .eq("id", targetUserId);

    if (error) {
      setRoleSaveError("Failed to reject user.");
      setApprovingFor(null);
      return;
    }

    setRoleSaveMessage("User rejected.");
    setApprovingFor(null);
    fetchManagedUsers();
  };

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

  const pendingUsers = managedUsers.filter((u) => u.membership_status === "pending");
  const activeUsers = managedUsers.filter((u) => u.membership_status === "active");

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ backgroundColor: "#c9d7e0" }}
    >
      <TopNav
        title="Profile"
        userId={userId}
        fallbackEmail={fallbackEmail ?? profile.email}
        activePage="profile"
        onNavigate={onNavigate}
      />

      <div className="container py-5">
        <div
          className="card shadow-sm border-0 mx-auto"
          style={{ maxWidth: 900, borderRadius: 14 }}
        >
          <div className="card-body p-4">
            <h2 className="mb-4" style={{ color: "#2c5282", fontWeight: "bold" }}>
              My Profile
            </h2>

            {loading ? (
              <p>Loading profile...</p>
            ) : (
              <>
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
                      value={profile.is_primary_admin ? "primary_admin" : userRole}
                      disabled
                    />
                    <div className="form-text">
                      {profile.is_primary_admin
                        ? "You are the primary admin of this organization."
                        : userRole === "admin"
                        ? "Your role is shown here. Admins can manage user roles in the section below."
                        : "Your role is shown here. Only admins can change user roles."}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Organization</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.org_name ?? "No organization"}
                      disabled
                    />
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

                {userRole === "admin" && (
                  <>
                    <hr className="my-4" />

                    <h5
                      className="mb-3"
                      style={{ color: "#2c5282", fontWeight: "bold" }}
                    >
                      User Role Management
                    </h5>
                    <p className="text-muted mb-3">
                      Admins can assign roles and control whether users have full
                      editing access or view-only access.
                    </p>

                    {roleSaveMessage && (
                      <div className="alert alert-success">{roleSaveMessage}</div>
                    )}
                    {roleSaveError && (
                      <div className="alert alert-danger">{roleSaveError}</div>
                    )}

                    {pendingUsers.length > 0 && (
                      <>
                        <h6 className="fw-semibold mb-2" style={{ color: "#c05621" }}>
                          Pending Approval ({pendingUsers.length})
                        </h6>
                        <div className="table-responsive mb-4">
                          <table className="table align-middle">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Requested Role</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingUsers.map((user) => (
                                <tr key={user.id}>
                                  <td>{user.name || "N/A"}</td>
                                  <td>{user.email || "N/A"}</td>
                                  <td>
                                    <span className="badge bg-warning text-dark">
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="d-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleApprove(user.id)}
                                      disabled={approvingFor === user.id}
                                    >
                                      {approvingFor === user.id ? "..." : "Approve"}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleReject(user.id)}
                                      disabled={approvingFor === user.id}
                                    >
                                      Reject
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    {usersLoading ? (
                      <p>Loading users...</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table align-middle">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeUsers.map((user) => (
                              <tr key={user.id}>
                                <td>{user.name || "N/A"}</td>
                                <td>{user.email || "N/A"}</td>
                                <td style={{ minWidth: 180 }}>
                                  {profile.is_primary_admin && user.id !== userId ? (
                                    <select
                                      className="form-select"
                                      value={user.role}
                                      onChange={(e) =>
                                        handleManagedRoleChange(
                                          user.id,
                                          e.target.value as UserRole
                                        )
                                      }
                                      disabled={savingRoleFor === user.id}
                                    >
                                      <option value="lab_tech">lab_tech</option>
                                      <option value="admin">admin</option>
                                    </select>
                                  ) : (
                                    /* The change is strictly inside this span! */
                                    <span className="badge bg-secondary">
                                      {profile.is_primary_admin && user.id === userId 
                                        ? "primary admin" 
                                        : user.role}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {profile.is_primary_admin && user.id !== userId ? (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      style={{
                                        backgroundColor: "#2c5282",
                                        borderColor: "#2c5282",
                                      }}
                                      onClick={() =>
                                        handleSaveManagedRole(user.id, user.role)
                                      }
                                      disabled={savingRoleFor === user.id}
                                    >
                                      {savingRoleFor === user.id ? "Saving..." : "Save"}
                                    </button>
                                  ) : (
                                    <span className="text-muted small">
                                      {user.id === userId ? "You" : "—"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
