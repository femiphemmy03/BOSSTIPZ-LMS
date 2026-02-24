import React, { useState, useEffect } from "react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { getProfiles } from "../services/api";

function StudentsPage() {
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadStudents() {
      if (!user) return;
      try {
        const data = await getProfiles(token);
        if (user.role === "student") {
          // student sees only themselves
          const myProfile = data.profiles?.find((p) => p.id === user.id);
          setStudents(myProfile ? [myProfile] : []);
        } else if (user.role === "lecturer") {
          // lecturer sees only students (filter role)
          const myStudents = data.profiles?.filter((p) => p.role === "student") || [];
          setStudents(myStudents);
        } else if (user.role === "admin") {
          // admin sees everyone
          setStudents(data.profiles || []);
        }
      } catch (err) {
        setMessage("Failed to load students.");
      }
    }
    loadStudents();
  }, [user, token]);

  if (!user) return <p>Please log in to view students.</p>;

  const renderStudents = () => {
    switch (user.role) {
      case "student":
        return (
          <div>
            <h2>👩‍🎓 Student Profile</h2>
            <p>View your profile and progress.</p>
            <ul>
              {students.map((s) => (
                <li key={s.id}>
                  {s.full_name} — {s.email} — {s.school_name} — Level {s.level}
                </li>
              ))}
            </ul>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      case "lecturer":
        return (
          <div>
            <h2>👩‍🎓 Manage Students</h2>
            <p>View and manage students enrolled in your courses.</p>
            <ul>
              {students.map((s) => (
                <li key={s.id}>
                  {s.full_name} — {s.email} — {s.school_name} — Level {s.level}
                </li>
              ))}
            </ul>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        );

      case "admin":
        return (
          <div>
            <h2>👩‍🎓 System‑wide Student Management</h2>
            <p>Oversee all students across the platform.</p>
            <ul>
              {students.map((s) => (
                <li key={s.id}>
                  {s.full_name} — {s.email} — {s.role}
                </li>
              ))}
            </ul>
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
      <main style={{ flex: 1, padding: "2rem" }}>
        {renderStudents()}
        {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
}

export default StudentsPage;
