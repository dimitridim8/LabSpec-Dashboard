import React from "react";
import TopNav from "../components/TopNav";

type HelpProps = {
  userId: string;
  fallbackEmail?: string;
  activePage: "help";
  onNavigate: (page: "dashboard" | "profile" | "help") => void;
};

const Help: React.FC<HelpProps> = ({ userId, fallbackEmail, onNavigate }) => {
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#c9d7e0" }}>
      <TopNav
        title="Help"
        userId={userId}
        fallbackEmail={fallbackEmail}
        activePage="help"
        onNavigate={onNavigate}
      />

      <div className="container py-5">
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 700, borderRadius: 14 }}>
          <div className="card-body p-4">
            <h2 className="mb-3" style={{ color: "#2c5282", fontWeight: "bold" }}>
              Help
            </h2>
            <p className="mb-0">
              Placeholder help page. Next we can add workflow guidance, FAQ, and lab contact info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;