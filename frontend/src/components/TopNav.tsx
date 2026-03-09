import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";

type Page = "dashboard" | "profile" | "help";

type TopNavProps = {
  title: string;                 // e.g. "Dashboard", "Profile"
  userId: string;
  fallbackEmail?: string;
  activePage: Page;              // to optionally highlight the current page
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
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Fetch name from profiles
  useEffect(() => {
    const fetchName = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("TopNav name fetch error:", error.message);
        setUserName("");
        return;
      }

      setUserName(data?.name ?? "");
    };

    fetchName();
  }, [userId]);

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
            className="btn btn-sm btn-light"
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