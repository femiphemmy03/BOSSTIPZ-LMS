// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import TRCNLogin from './pages/TRCNLogin.jsx';
import TrcnLanding from './pages/TrcnLanding.jsx'; // question selection page
import TRCNPage from './pages/TRCNPage.jsx';       // actual test page

// Role-aware pages
import AssignmentsPage from "./pages/AssignmentsPage.jsx"; 
import CoursesPages from "./pages/CoursesPages.jsx"; 
import PaymentsPage from "./pages/PaymentsPage.jsx"; 
import TopicsPage from "./pages/TopicsPage.jsx"; 
import StudentsPage from "./pages/StudentsPage.jsx";

// Admin pages
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminContentPage from "./pages/AdminContentPage.jsx";
import AdminPaymentsPage from "./pages/AdminPaymentsPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import AdminSettingsPage from "./pages/AdminSettingsPage.jsx";
import AdminEndSemesterPage from "./pages/AdminEndSemesterPage.jsx";

// Simple auth helpers (replace with your real auth/session)
const getUser = () => JSON.parse(sessionStorage.getItem('user')) || null;
const getTrcnSession = () => JSON.parse(sessionStorage.getItem('trcnSession')) || null;

function ProtectedRoute({ children, roles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

// TRCN protection: requires successful TRCN auth + payment flag
function ProtectedTrcnRoute({ children }) {
  const trcnSession = getTrcnSession();
  if (!trcnSession || !trcnSession.paid) return <Navigate to="/trcn-login" replace />;
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing = Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard (role-based) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={['student', 'lecturer', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin route (role required) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Courses (student/lecturer/admin) */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute roles={['student','lecturer','admin']}>
              <CoursesPages />
            </ProtectedRoute>
          }
        />

        {/* Assignments */}
        <Route
          path="/assignments"
          element={
            <ProtectedRoute roles={['student','lecturer','admin']}>
              <AssignmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Payments */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute roles={['student','admin']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        {/* Topics */}
        <Route
          path="/topics"
          element={
            <ProtectedRoute roles={['student','lecturer','admin']}>
              <TopicsPage />
            </ProtectedRoute>
          }
        />

        {/* Students */}
        <Route
          path="/students"
          element={
            <ProtectedRoute roles={['lecturer','admin','student']}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin-specific pages */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/content"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminContentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/end-semester"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminEndSemesterPage />
            </ProtectedRoute>
          }
        />

        {/* TRCN auth */}
        <Route path="/trcn-login" element={<TRCNLogin />} />
        <Route
          path="/trcn-landing"
          element={
            <ProtectedTrcnRoute>
              <TrcnLanding />
            </ProtectedTrcnRoute>
          }
        />
        <Route
          path="/trcn"
          element={
            <ProtectedTrcnRoute>
              <TRCNPage />
            </ProtectedTrcnRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
