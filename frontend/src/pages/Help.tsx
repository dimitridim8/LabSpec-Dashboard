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
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: 800, borderRadius: 14 }}>
          <div className="card-body p-4">

            {/* Title */}
            <h2 className="mb-3" style={{ color: "#2c5282", fontWeight: "bold" }}>
              Help & Support
            </h2>

            {/* Intro */}
            <p>
              Welcome to the LabSpec Dashboard help center. This page provides guidance on how to use the system,
              understand specimen statuses, and troubleshoot common issues.
            </p>

            {/* Divider */}
            <hr />

            {/* Getting Started */}
            <h5 style={{ color: "#2c5282", fontWeight: "600" }}>Getting Started</h5>
            <ul>
              <li>Log in to access your dashboard</li>
              <li>View all specimens and their current statuses</li>
              <li>Use the search bar to find specimens by ID, type, or location</li>
              <li>Apply filters to narrow results by status or storage location</li>
              <li>Update your profile settings from the Profile page</li>
            </ul>

            {/* Divider */}
            <hr />

            {/* Status Definitions */}
            <h5 style={{ color: "#2c5282", fontWeight: "600" }}>Specimen Status Definitions</h5>
            <ul>
              <li><strong>Pending:</strong> Specimen has been logged but not yet processed</li>
              <li><strong>In Progress:</strong> Actively being processed</li>
              <li><strong>Incubating:</strong> Currently in incubation stage</li>
              <li><strong>Awaiting AST:</strong> Waiting for antimicrobial susceptibility testing</li>
              <li><strong>Completed:</strong> Processing is finished</li>
              <li><strong>Flagged:</strong> Requires attention or has an issue</li>
            </ul>

            {/* Divider */}
            <hr />

            {/* FAQ */}
            <h5 style={{ color: "#2c5282", fontWeight: "600" }}>Frequently Asked Questions</h5>
            <ul>
              <li><strong>How do I search for a specimen?</strong> Use the search bar at the top of the dashboard.</li>
              <li><strong>Why can’t I find a specimen?</strong> Check filters or confirm the correct ID/code.</li>
              <li><strong>How do I update my information?</strong> Navigate to the Profile page.</li>
              <li><strong>Why is data not loading?</strong> Try refreshing the page or logging out and back in.</li>
            </ul>

            {/* Divider */}
            <hr />

            {/* Troubleshooting */}
            <h5 style={{ color: "#2c5282", fontWeight: "600" }}>Troubleshooting</h5>
            <ul>
              <li>Refresh the page if data is not loading</li>
              <li>Ensure you are logged in</li>
              <li>Check your internet connection</li>
              <li>Verify all required fields are filled when adding specimens</li>
            </ul>

            {/* Divider */}
            <hr />

            {/* Contact */}
            <h5 style={{ color: "#2c5282", fontWeight: "600" }}>Contact Support</h5>
            <p className="mb-0">
              If you need assistance or encounter any issues, please contact us at:
              <br />
              <strong>labspecdashboard@gmail.com</strong>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
