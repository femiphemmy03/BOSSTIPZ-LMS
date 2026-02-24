import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import Modal from "../components/Modal.jsx";
import { getProfiles, signupUser } from "../services/api";

function AdminUsersPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // State for modals
  const [showViewUsers, setShowViewUsers] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);

  // Data state
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  if (!user) return <p>Please log in to view this page.</p>;

  const loadUsers = async () => {
    const data = await getProfiles(token);
    setUsers(data.profiles || []);
  };

  const renderUsers = () => {
    switch (user.role) {
      case "admin":
        return (
          <div>
            <h2>👥 Manage Users</h2>
            <p>View, add, edit, delete users, and manage roles & permissions.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <Button onClick={() => { setShowViewUsers(true); loadUsers(); }}>View All Users</Button>
              <Button onClick={() => setShowAddUser(true)}>Add New User</Button>
              <Button onClick={() => setShowEditUser(true)}>Edit User Role</Button>
              <Button onClick={() => setShowDeleteUser(true)}>Delete User</Button>
              <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
            </div>

            {/* View Users Modal */}
            {showViewUsers && (
              <Modal title="All Users" onClose={() => setShowViewUsers(false)}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  <ul>
                    {users.map((u) => (
                      <li key={u.id}>
                        {u.full_name} — {u.email} — {u.role}
                      </li>
                    ))}
                  </ul>
                </div>
              </Modal>
            )}

            {/* Add User Modal */}
            {showAddUser && (
              <Modal title="Add New User" onClose={() => setShowAddUser(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const payload = {
                      full_name: formData.get("full_name"),
                      email: formData.get("email"),
                      password: "default123", // temporary password
                      role: formData.get("role"),
                      matric_number: formData.get("matric_number"),
                      school_name: formData.get("school_name"),
                      level: formData.get("level"),
                    };
                    const res = await signupUser(payload);
                    setMessage(res.message || res.error);
                    setShowAddUser(false);
                  }}
                >
                  <input name="full_name" type="text" placeholder="Full Name" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <input name="email" type="email" placeholder="Email" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <select name="role" required style={{ width: "100%", marginBottom: "1rem" }}>
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <input name="matric_number" type="text" placeholder="Matric Number (students only)" style={{ width: "100%", marginBottom: "1rem" }} />
                  <input name="school_name" type="text" placeholder="School Name" style={{ width: "100%", marginBottom: "1rem" }} />
                  <input name="level" type="text" placeholder="Level" style={{ width: "100%", marginBottom: "1rem" }} />
                  <Button type="submit">Add User</Button>
                </form>
              </Modal>
            )}

            {/* Edit User Modal */}
            {showEditUser && (
              <Modal title="Edit User Role" onClose={() => setShowEditUser(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // TODO: call backend PATCH /profiles/:id/role
                    setMessage("Role update endpoint to be added in backend.");
                    setShowEditUser(false);
                  }}
                >
                  <input type="email" placeholder="User Email" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <select required style={{ width: "100%", marginBottom: "1rem" }}>
                    <option value="">Select New Role</option>
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button type="submit">Update Role</Button>
                </form>
              </Modal>
            )}

            {/* Delete User Modal */}
            {showDeleteUser && (
              <Modal title="Delete User" onClose={() => setShowDeleteUser(false)}>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // TODO: call backend DELETE /profiles/:id
                    setMessage("Delete user endpoint to be added in backend.");
                    setShowDeleteUser(false);
                  }}
                >
                  <input type="email" placeholder="User Email" required style={{ width: "100%", marginBottom: "1rem" }} />
                  <Button type="submit" style={{ backgroundColor: "#FF5500", color: "#fff" }}>
                    Delete User
                  </Button>
                </form>
              </Modal>
            )}

            {message && <p style={{ marginTop: "1rem", color: "#FF5500" }}>{message}</p>}
          </div>
        );

      case "lecturer":
        return (
          <div>
            <h2>👥 Access Restricted</h2>
            <p>Lecturers cannot manage users. Please return to your dashboard.</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      case "student":
        return (
          <div>
            <h2>👥 Access Restricted</h2>
            <p>Students cannot manage users. Please return to your dashboard.</p>
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
      <main style={{ flex: 1, padding: "2rem" }}>{renderUsers()}</main>
      <Footer />
    </div>
  );
}

export default AdminUsersPage;
