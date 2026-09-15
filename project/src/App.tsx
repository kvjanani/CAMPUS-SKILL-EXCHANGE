import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import Landing from '@/pages/public/Landing';
import About from '@/pages/public/About';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';

import Dashboard from '@/pages/student/Dashboard';
import Profile from '@/pages/student/Profile';
import MySkills from '@/pages/student/MySkills';
import SkillForm from '@/pages/student/SkillForm';
import BrowseSkills from '@/pages/student/BrowseSkills';
import SkillDetails from '@/pages/student/SkillDetails';
import HelpRequests from '@/pages/student/HelpRequests';
import HelpRequestForm from '@/pages/student/HelpRequestForm';
import HelpRequestDetails from '@/pages/student/HelpRequestDetails';
import MyRequests from '@/pages/student/MyRequests';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManageUsers from '@/pages/admin/ManageUsers';
import ManageSkills from '@/pages/admin/ManageSkills';
import ManageRequests from '@/pages/admin/ManageRequests';
import ManageFeedback from '@/pages/admin/ManageFeedback';

import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

function AdminRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student (protected) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/my-skills" element={<ProtectedRoute><MySkills /></ProtectedRoute>} />
      <Route path="/my-skills/new" element={<ProtectedRoute><SkillForm /></ProtectedRoute>} />
      <Route path="/my-skills/:id/edit" element={<ProtectedRoute><SkillForm /></ProtectedRoute>} />
      <Route path="/browse-skills" element={<ProtectedRoute><BrowseSkills /></ProtectedRoute>} />
      <Route path="/skills/:id" element={<ProtectedRoute><SkillDetails /></ProtectedRoute>} />
      <Route path="/help-requests" element={<ProtectedRoute><HelpRequests /></ProtectedRoute>} />
      <Route path="/help-requests/new" element={<ProtectedRoute><HelpRequestForm /></ProtectedRoute>} />
      <Route path="/requests/:id" element={<ProtectedRoute><HelpRequestDetails /></ProtectedRoute>} />
      <Route path="/requests/:id/edit" element={<ProtectedRoute><HelpRequestForm /></ProtectedRoute>} />
      <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />

      {/* Redirect after login */}
      <Route path="/redirect" element={<AdminRedirect />} />

      {/* Admin (protected + admin only) */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/skills" element={<ProtectedRoute adminOnly><ManageSkills /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute adminOnly><ManageRequests /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute adminOnly><ManageFeedback /></ProtectedRoute>} />

      {/* Errors */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
