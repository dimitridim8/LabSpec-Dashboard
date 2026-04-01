import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

type Page = "dashboard" | "profile" | "help" | "organization";

type TopNavProps = {
  title: string;
  userId: string;
  fallbackEmail?: string;
  activePage: Page;
  onNavigate: (page: Page) => void;
};

const TopNav: React.FC<TopNavProps> = ({
  title,
  userId,
  fallbackEmail,
  activePage,
  onNavigate,
}) => {
  const [userName, setUserName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPrimaryAdmin, setIsPrimaryAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fetch name and primary admin status
  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, is_primary_admin, org_id")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("TopNav profile fetch error:", error.message);
        return;
      }

      setUserName(data?.name ?? "");
      setIsPrimaryAdmin(data?.is_primary_admin ?? false);
    };

    fetchProfile();
  }, [userId]);

  // Poll for pending join requests (primary admin only)
  useEffect(() => {
    if (!isPrimaryAdmin) {
      setPendingCount(0);
      return;
    }

    const fetchPending = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userId)
        .single();

      if (!profileData?.org_id) return;

      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", profileData.org_id)
        .eq("membership_status", "pending");

      setPendingCount(count ?? 0);
    };

    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, [userId, isPrimaryAdmin]);

  // Close dropdown on outside click / ESC
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const WelcomeText = userName
    ? `Welcome, ${userName}`
    : fallbackEmail
      ? `Welcome, ${fallbackEmail}`
      : "Welcome";

  return (
    <nav
      className="navbar navbar-dark shadow-sm p-3"
      style={{ backgroundColor: "#2c5282", overflow: "visible", position: "relative" }}
    >
      <span className="navbar-brand mb-0 h1">
        <b>LabSpec</b> {title}
      </span>

      <div className="text-white d-flex align-items-center gap-3">
        <span>{WelcomeText}</span>

        <div className="dropdown position-relative" ref={menuRef} style={{ overflow: "visible" }}>
          <button
            type="button"
            className="btn btn-sm btn-light position-relative"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            title="Menu"
            style={{
              width: 38,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ☰
            {/* Burger button badge — visible when menu is closed and there are pending requests */}
            {!menuOpen && pendingCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle rounded-circle bg-danger"
                style={{
                  width: 10,
                  height: 10,
                  display: "block",
                  border: "2px solid #2c5282",
                }}
              />
            )}
          </button>

          <div
            className={`dropdown-menu dropdown-menu-end ${menuOpen ? "show" : ""}`}
            style={{ top: "100%", right: 0, left: "auto", marginTop: 8, zIndex: 3000 }}
          >
            <button
              className={`dropdown-item ${activePage === "dashboard" ? "active" : ""}`}
              onClick={() => { setMenuOpen(false); onNavigate("dashboard"); }}
            >
              Dashboard
            </button>

            <button
              className={`dropdown-item ${activePage === "profile" ? "active" : ""}`}
              onClick={() => { setMenuOpen(false); onNavigate("profile"); }}
            >
              Profile
            </button>

            {
              <button
                className={`dropdown-item d-flex align-items-center justify-content-between ${activePage === "organization" ? "active" : ""}`}
                onClick={() => { setMenuOpen(false); onNavigate("organization"); }}
              >
                <span>Organization</span>
                {pendingCount > 0 && (
                  <span
                    className="badge rounded-pill bg-danger ms-2"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            }

            <button
              className={`dropdown-item ${activePage === "help" ? "active" : ""}`}
              onClick={() => { setMenuOpen(false); onNavigate("help"); }}
            >
              Help
            </button>

            <div className="dropdown-divider" />

            <button
              className="dropdown-item text-danger"
              onClick={async () => {
                setMenuOpen(false);
                await supabase.auth.signOut();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
