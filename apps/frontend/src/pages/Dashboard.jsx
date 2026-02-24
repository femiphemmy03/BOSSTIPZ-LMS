// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { getCourses, getAssignments, getPayments, getProfiles } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || null;
  const token = sessionStorage.getItem("token");

  // State hooks for summaries
  const [coursesCount, setCoursesCount] = useState(0);
  const [topicsCount, setTopicsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [trcnAttempts, setTrcnAttempts] = useState(0);

  const [usersCount, setUsersCount] = useState(0);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);

  const summaryStyle = {
    backgroundColor: "#FFE0CC",
    padding: "1.5rem",
    borderRadius: "10px",
    textAlign: "center",
    flex: "1 1 220px",
    margin: "0.75rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    fontSize: "18px",
    fontWeight: "bold",
  };

  const buttonGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  };

  // Load data depending on role
  useEffect(() => {
    async function loadData() {
      if (!user) return;

      if (user.role === "student") {
        const courses = await getCourses(token);
        setCoursesCount(courses.courses?.length || 0);

        // Topics unlocked (simplified: count all topics for now)
        const topics = courses.courses?.flatMap(c => c.topics || []) || [];
        setTopicsCount(topics.length);

        const assignments = await getAssignments(token, 1); // replace with student’s topicId
        setAssignmentsCount(assignments.assignments?.length || 0);

        // TRCN attempts (placeholder until TRCN route is added)
        setTrcnAttempts(0);
      }

      if (user.role === "lecturer") {
        const courses = await getCourses(token);
        const myCourses = courses.courses?.filter(c => c.lecturer_id === user.id) || [];
        setCoursesCount(myCourses.length);

        const topics = myCourses.flatMap(c => c.topics || []);
        setTopicsCount(topics.length);

        // Students count (simplified: from payments)
        const payments = await getPayments(token);
        const studentIds = [...new Set(payments.payments?.map(p => p.student_id))];
        setUsersCount(studentIds.length);

        const assignments = await getAssignments(token, 1); // replace with lecturer’s topicId
        setAssignmentsCount(assignments.assignments?.length || 0);
      }

      if (user.role === "admin") {
        const profiles = await getProfiles(token);
        setUsersCount(profiles.profiles?.length || 0);

        const payments = await getPayments(token);
        const total = payments.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        setPaymentsTotal(total);

        const courses = await getCourses(token);
        setActiveCourses(courses.courses?.filter(c => c.published).length || 0);
      }
    }

    loadData();
  }, [user, token]);

  // Student dashboard
  const renderStudentDashboard = () => (
    <div style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "3rem" }}>
        <div style={summaryStyle}>📚 Enrolled Courses: {coursesCount}</div>
        <div style={summaryStyle}>📖 Unlocked Topics: {topicsCount}</div>
        <div style={summaryStyle}>📝 Submitted Assignments: {assignmentsCount}</div>
        <div style={summaryStyle}>🎯 TRCN Attempts: {trcnAttempts}</div>
      </div>

      <div style={buttonGridStyle}>
        <Button onClick={() => navigate("/courses")}>View Courses</Button>
        <Button onClick={() => navigate("/assignments")}>View Assignments</Button>
        <Button onClick={() => navigate("/trcn-login")}>Start TRCN Practice</Button>
        <Button onClick={() => navigate("/payments")}>View Payment History</Button>
      </div>
    </div>
  );

  // Lecturer dashboard
  const renderLecturerDashboard = () => (
    <div style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "3rem" }}>
        <div style={summaryStyle}>📚 Total Courses: {coursesCount}</div>
        <div style={summaryStyle}>📖 Total Topics: {topicsCount}</div>
        <div style={summaryStyle}>👩‍🎓 Total Students: {usersCount}</div>
        <div style={summaryStyle}>📝 Pending Assignments: {assignmentsCount}</div>
      </div>

      <div style={buttonGridStyle}>
        <Button onClick={() => navigate("/courses")}>Manage Courses & Topics</Button>
        <Button onClick={() => navigate("/assignments")}>Manage Assignments</Button>
        <Button onClick={() => navigate("/students")}>View Students</Button>
      </div>
    </div>
  );

  // Admin dashboard
  const renderAdminDashboard = () => (
    <div style={{ marginTop: "4rem", marginBottom: "4rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "3rem" }}>
        <div style={summaryStyle}>👥 Total Users: {usersCount}</div>
        <div style={summaryStyle}>💳 Total Payments: ₦{paymentsTotal}</div>
        <div style={summaryStyle}>📊 Reports Generated: 0</div>
        <div style={summaryStyle}>⚙️ Active Courses: {activeCourses}</div>
      </div>

      <div style={buttonGridStyle}>
        <Button onClick={() => navigate("/admin/users")}>Manage Users</Button>
        <Button onClick={() => navigate("/admin/content")}>📘 Manage Content</Button>
        <Button onClick={() => navigate("/admin/payments")}>Monitor Payments</Button>
        <Button onClick={() => navigate("/admin/reports")}>View Reports</Button>
        {/* System Settings removed for MVP */}
        <Button
          style={{ backgroundColor: "#FF5500", color: "#fff" }}
          onClick={() => navigate("/admin/end-semester")}
        >
          End Semester (Clear All Submissions)
        </Button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!user) {
      return <p style={{ textAlign: "center" }}>No role assigned. Please log in.</p>;
    }
    switch (user.role) {
      case "student":
        return renderStudentDashboard();
      case "lecturer":
        return renderLecturerDashboard();
      case "admin":
        return renderAdminDashboard();
      default:
        return <p style={{ textAlign: "center" }}>Unknown role.</p>;
    }
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <main style={{ flex: 1, padding: "2rem" }}>
        {renderDashboard()}
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
