import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./Components/Layout";
import Login from "./Components/Login";
import SignUp from "./Components/Signup";
import VerifyOTP from "./Components/Verify";
import ForgotPassword from "./Components/ForgotPassword";
import CreateNewPassword from "./Components/CreateNewPassword";
import Dashboard from "./Components/Dashboard";
import Settings from "./Components/Settings";
import StockDetail from "./Components/StockDetails";
import Portfolio from "./Components/Portfolio";
import StockPrediction from "./Components/StockPrediction";

// Redirect to dashboard for invalid routes
const NotFoundRedirect = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);
  return null;
};

// ProtectedRoute to guard authenticated routes
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");

  React.useEffect(() => {
    if (!token || !userId) {
      navigate("/login");
    }
  }, [navigate, token, userId]);

  return token && userId ? <Layout>{children}</Layout> : null;
};

// Public route with layout
const PublicRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

// VerifyRoute to guard "/verify" and "/create-new-password"
const VerifyRoute = ({ children }) => {
  const navigate = useNavigate();
  const email = localStorage.getItem("emailid");

  React.useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [navigate, email]);

  return email ? children : null;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<VerifyRoute><VerifyOTP /></VerifyRoute>} />
        <Route path="/create-new-password" element={<VerifyRoute><CreateNewPassword /></VerifyRoute>} />

        {/* Public Routes */}
        <Route path="/dashboard" element={<PublicRoute><Dashboard /></PublicRoute>} />
        <Route path="/prediction" element={<PublicRoute><StockPrediction /></PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/stock/:symbol" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />

        {/* Catch-all Route */}
        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;