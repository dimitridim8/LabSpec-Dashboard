import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import TopNav from "../components/TopNav";

type UserRole = "admin" | "lab_tech";

type OrganizationProps = {
  userId: string;
  fallbackEmail?: string;
  onNavigate: (page: "dashboard" | "profile" | "help" | "organization") => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
};

type ProfileData = {
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

const Organization: React.FC<OrganizationProps> = ({
  userId,
  fallbackEmail,
  onNavigate,
  userRole,
  setUserRole,
}) => {
  const [profile, setProfile] = useState<ProfileData>({
    is_primary_admin: false,
    org_id: null,
    org_name: null,
  });

  const [loading, setLoading] = useState(true);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleSaveMessage, setRoleSaveMessage] = useState<string | null>(null);
  const [roleSaveError, setRoleSaveError] = useState<string | null>(null);
  const [savingRoleFor, setSavingRoleFor] = useState<string | null>(null);
  const [approvingFor, setApprovingFor] = useState<string | null>(null);

  // Load profile + org info
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("is_primary_admin, org_id")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setLoading(false);
        return;
      }

      let orgName: string | null = null;
      if (data?.org_id) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", data.org_id)
          .single();
        orgName = orgData?.name ?? null;
      }

      setProfile({
        is_primary_admin: data?.is_primary_admin ?? false,
        org_id: data?.org_id ?? null,
        org_name: orgName,
      });

      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  // Fetch members for all roles — admins get all statuses, lab techs only need active
  const fetchManagedUsers = async (orgId: string) => {
    setUsersLoading(true);
    setRoleSaveError(null);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role, membership_status")
      .eq("org_id", orgId)
      .order("email", { ascending: true });

    if (error) {
      console.error("Failed to fetch users:", error.message);
      setRoleSaveError("Failed to load members.");
      setUsersLoading(false);
      return;
    }

    const normalized: ManagedUser[] = (data || []).map((user) => ({
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role === "admin" ? "admin" : "lab_tech",
      membership_status: user.membership_status ?? "active",
    }));

    setManagedUsers(normalized);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (profile.org_id) {
      fetchManagedUsers(profile.org_id);
    }
  }, [profile.org_id]);

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
      setRoleSaveError("Failed to update user role.");
      setSavingRoleFor(null);
      return;
    }

    if (targetUserId === userId) {
      setUserRole(newRole);
      onNavigate("organization");
    }

    setRoleSaveMessage("User role updated successfully.");
    setSavingRoleFor(null);
    if (profile.org_id) fetchManagedUsers(profile.org_id);
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
    if (profile.org_id) fetchManagedUsers(profile.org_id);
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
    if (profile.org_id) fetchManagedUsers(profile.org_id);
  };

  const pendingUsers = managedUsers.filter((u) => u.membership_status === "pending");
  const activeUsers = managedUsers.filter((u) => u.membership_status === "active");

return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#c9d7e0" }}>
      <TopNav
        title="Organization"
        userId={userId}
        fallbackEmail={fallbackEmail}
        activePage="organization"
        onNavigate={onNavigate}
      />

      <div className="container py-5">
        <div
          className="card shadow-sm border-0 mx-auto"
          style={{ maxWidth: 900, borderRadius: 14 }}
        >
          <div className="card-body p-4">
            <h2 className="mb-1" style={{ color: "#2c5282", fontWeight: "bold" }}>
              Organization
            </h2>

            {loading ? (
              <p className="text-muted mt-3">Loading...</p>
            ) : (
              <>
                {/* Org Info Card */}
                <div
                  className="rounded p-3 mb-4 d-flex align-items-center gap-3"
                  style={{ backgroundColor: "#eef2f7", border: "1px solid #d0dce8" }}
                >
                  <div>
                    <div className="fw-bold" style={{ color: "#2c5282", fontSize: "1.05rem" }}>
                      {profile.org_name ?? "No organization"}
                    </div>
                    <div className="text-muted small">
                      Your role:{" "}
                      <span className="badge bg-secondary ms-1">
                        {profile.is_primary_admin ? "primary admin" : userRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── 1. PRIMARY ADMIN ONLY: PENDING REQUESTS ── */}
                {profile.is_primary_admin && (
                  <>
                    <h5 className="mb-1" style={{ color: "#2c5282", fontWeight: "bold" }}>
                      Pending Approvals
                    </h5>
                    {roleSaveMessage && <div className="alert alert-success py-2">{roleSaveMessage}</div>}
                    {roleSaveError && <div className="alert alert-danger py-2">{roleSaveError}</div>}

                    {pendingUsers.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table align-middle">
                          <thead className="table-light">
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
                                <td><span className="badge bg-warning text-dark">{user.role}</span></td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleApprove(user.id)}
                                      disabled={approvingFor === user.id}
                                    >
                                      {approvingFor === user.id ? "..." : "Approve"}
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleReject(user.id)}
                                      disabled={approvingFor === user.id}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded p-3 mb-4 d-flex align-items-center gap-2 small text-muted" style={{ backgroundColor: "#f0f4f8", border: "1px dashed #b0bec5" }}>
                        <span>✅</span> No pending join requests.
                      </div>
                    )}
                  </>
                )}

                {/* ── 2. EVERYONE SEES: ACTIVE MEMBERS ── */}
                <h5 className="mb-1 mt-4" style={{ color: "#2c5282", fontWeight: "bold" }}>
                  Active Members
                </h5>
                <p className="text-muted small mb-3">
                  {profile.is_primary_admin 
                    ? "Manage user roles and permissions." 
                    : "Members currently active in your organization."}
                </p>

                {usersLoading ? (
                  <p className="text-muted small">Loading members...</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          {profile.is_primary_admin && <th>Action</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {activeUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              {user.name || "N/A"}
                              {user.id === userId && <span className="badge bg-light text-secondary ms-2 small">You</span>}
                            </td>
                            <td>{user.email || "N/A"}</td>
                            <td>
                              {profile.is_primary_admin && user.id !== userId ? (
                                <select
                                  className="form-select form-select-sm"
                                  value={user.role}
                                  onChange={(e) => handleManagedRoleChange(user.id, e.target.value as UserRole)}
                                  disabled={savingRoleFor === user.id}
                                >
                                  <option value="lab_tech">lab_tech</option>
                                  <option value="admin">admin</option>
                                </select>
                              ) : (
                                <span className="badge bg-secondary">
                                  {user.id === userId && profile.is_primary_admin ? "primary admin" : user.role}
                                </span>
                              )}
                            </td>
                            {profile.is_primary_admin && (
                              <td>
                                {user.id !== userId ? (
                                  <button
                                    className="btn btn-sm btn-primary"
                                    style={{ backgroundColor: "#2c5282", borderColor: "#2c5282" }}
                                    onClick={() => handleSaveManagedRole(user.id, user.role)}
                                    disabled={savingRoleFor === user.id}
                                  >
                                    {savingRoleFor === user.id ? "Saving..." : "Save"}
                                  </button>
                                ) : <span className="text-muted small">You</span>}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organization;
