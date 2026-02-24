import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";

function AdminSettingsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const navigate = useNavigate();

  // State for modals
  const [showPreferences, setShowPreferences] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [showRestore, setShowRestore] = useState(false);

  if (!user) return <p>Please log in to view this page.</p>;

  const renderSettingsManagement = () => {
    switch (user.role) {
      // ========================= ADMIN =========================
      case "admin":
        return (
          <div>
            <h2>⚙️ System Settings</h2>
            <p>Configure platform‑wide settings and preferences.</p>

            <Button onClick={() => setShowPreferences(true)}>Update System Preferences</Button>
            <Button onClick={() => setShowRoles(true)}>Manage Roles & Permissions</Button>
            <Button onClick={() => setShowBackup(true)}>Backup System Data</Button>
            <Button onClick={() => setShowRestore(true)}>Restore System Data</Button>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>

            {/* Preferences Modal */}
            {showPreferences && (
              <Modal title="Update System Preferences" onClose={() => setShowPreferences(false)}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("System preferences updated!");
                    setShowPreferences(false);
                  }}
                >
                  <label>Platform Name</label>
                  <input type="text" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <label>Default Theme</label>
                  <select style={{ width: "100%", marginBottom: "1rem" }}>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                  <Button type="submit">Save Preferences</Button>
                </form>
              </Modal>
            )}

            {/* Roles & Permissions Modal */}
            {showRoles && (
              <Modal title="Manage Roles & Permissions" onClose={() => setShowRoles(false)}>
                <p>Assign or revoke roles for users.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Roles updated!");
                    setShowRoles(false);
                  }}
                >
                  <input
                    type="text"
                    placeholder="User Email"
                    required
                    style={{ width: "100%", marginBottom: "1rem" }}
                  />
                  <select required style={{ width: "100%", marginBottom: "1rem" }}>
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit">Update Role</Button>
                </form>
              </Modal>
            )}

            {/* Backup Modal */}
            {showBackup && (
              <Modal title="Backup System Data" onClose={() => setShowBackup(false)}>
                <p>Click below to create a backup of system data.</p>
                <Button onClick={() => alert("System backup created!")}>Create Backup</Button>
              </Modal>
            )}

            {/* Restore Modal */}
            {showRestore && (
              <Modal title="Restore System Data" onClose={() => setShowRestore(false)}>
                <p>Upload a backup file to restore system data.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("System data restored!");
                    setShowRestore(false);
                  }}
                >
                  <input type="file" required style={{ marginBottom: "1rem" }} />
                  <Button type="submit">Restore</Button>
                </form>
              </Modal>
            )}
          </div>
        );

      // ========================= LECTURER =========================
      case "lecturer":
        return (
          <div>
            <h2>⚙️ Access Restricted</h2>
            <p>Lecturers cannot access system settings. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      // ========================= STUDENT =========================
      case "student":
        return (
          <div>
            <h2>⚙️ Access Restricted</h2>
            <p>Students cannot access system settings. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      default:
        return <p>Unknown role.</p>;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, padding: "2rem" }}>{renderSettingsManagement()}</main>
      <Footer />
    </div>
  );
}

export default AdminSettingsPage;
