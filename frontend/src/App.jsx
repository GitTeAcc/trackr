import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing       from "./pages/Landing";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Dashboard     from "./pages/Dashboard";
import Transactions  from "./pages/Transactions";
import AddTransaction from "./pages/AddTransaction";
import Categories    from "./pages/Categories";
import Budgets       from "./pages/Budgets";
import Reports       from "./pages/Reports";
import Profile       from "./pages/Profile";
import Household     from "./pages/Household";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes — redirect to dashboard if already logged in */}
      <Route path="/"        element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login"   element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected routes */}
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/add"          element={<ProtectedRoute><AddTransaction /></ProtectedRoute>} />
      <Route path="/categories"   element={<ProtectedRoute><Categories /></ProtectedRoute>} />
      <Route path="/budgets"      element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
      <Route path="/reports"      element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/household"    element={<ProtectedRoute><Household /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
