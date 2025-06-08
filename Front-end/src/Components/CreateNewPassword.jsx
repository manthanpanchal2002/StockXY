import React, { useState } from "react";
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  TrendingUp,
  LineChart,
  Activity,
  KeyRound,
  PieChart,
  ScatterChart,
  Check,
  X,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const CreateNewPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const token = searchParams.get("token"); 

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*]/.test(value),
      });
    }
  };

  const showResetNotification = (type, message) => {
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      if (type === "success") {
        navigate("/login");
      }
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!token) {
      toast.error("No reset token provided");
      setIsLoading(false);
      return;
    }

    if (!Object.values(passwordChecks).every((check) => check)) {
      toast.error("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/reset-password`,
        {
          token,
          newPassword: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Password reset successfully") {
        showResetNotification("success");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      if (error.response?.status === 400) {
        showResetNotification("error", error.response.data.error || "Invalid or expired token");
      } else {
        showResetNotification("error", "Failed to reset password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ satisfied, text }) => (
    <div className={`flex items-center gap-2 text-sm ${satisfied ? "text-emerald-400" : "text-red-400"}`}>
      {satisfied ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Notification Overlay */}
      {showNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className={`transform transition-all duration-500 ${showNotification ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
            {notificationType === "success" ? (
              <div className="bg-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-emerald-500/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20"></div>
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 relative z-10 animate-pulse" />
                </div>
                <p className="text-emerald-400 font-semibold text-xl">Password Reset Successful!</p>
                <p className="text-white/60">Redirecting to login...</p>
              </div>
            ) : (
              <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-red-500/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400/20"></div>
                  <XCircle className="w-16 h-16 text-red-400 relative z-10 animate-pulse" />
                </div>
                <p className="text-red-400 font-semibold text-xl">Password Reset Failed</p>
                <p className="text-white/60">{notificationType === "error" ? "Invalid or expired token" : "Please try again."}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 text-emerald-500/10 transform rotate-12 animate-float-slow">
          <TrendingUp size={120} />
        </div>
        <div className="absolute bottom-20 right-10 text-emerald-500/10 transform -rotate-12 animate-float-slower">
          <LineChart size={120} />
        </div>
        <div className="absolute top-1/3 right-20 text-emerald-500/10 transform rotate-65 animate-float-medium">
          <Activity size={80} />
        </div>
        <div className="absolute bottom-1/3 left-20 text-emerald-500/10 transform rotate-65 animate-float-medium">
          <Activity size={80} />
        </div>
        <div className="absolute bottom-40 left-95 text-emerald-500/10 transform -rotate-12 animate-float-medium">
          <PieChart size={200} />
        </div>
        <div className="absolute top-40 right-100 text-emerald-500/10 transform rotate-20 animate-float-slower">
          <ScatterChart size={170} />
        </div>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full filter blur-3xl animate-orb-1"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-orb-2"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Animated Logo Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/20 group hover:scale-110 transition-transform duration-300 relative">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
            <KeyRound className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-center mb-2 animate-fade-in">
                Create New Password
              </h2>
              <p className="text-emerald-400 text-center font-medium animate-fade-in-delayed">
                Choose a strong password for your account
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative transform hover:scale-[1.02] transition-transform duration-200">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {passwordVisible ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Password requirements */}
                {formData.password && (
                  <div className="mt-2 space-y-1 bg-white/5 p-3 rounded-lg border border-white/10">
                    <PasswordRequirement
                      satisfied={passwordChecks.length}
                      text="At least 8 characters"
                    />
                    <PasswordRequirement
                      satisfied={passwordChecks.uppercase}
                      text="One uppercase letter"
                    />
                    <PasswordRequirement
                      satisfied={passwordChecks.lowercase}
                      text="One lowercase letter"
                    />
                    <PasswordRequirement
                      satisfied={passwordChecks.number}
                      text="One number"
                    />
                    <PasswordRequirement
                      satisfied={passwordChecks.special}
                      text="One special character"
                    />
                  </div>
                )}
              </div>

              <div className="relative transform hover:scale-[1.02] transition-transform duration-200">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-emerald-400 transition-colors duration-200"
                  >
                    {confirmPasswordVisible ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div
                    className={`mt-2 text-sm ${
                      formData.password === formData.confirmPassword ? "text-emerald-400" : "text-red-400"
                    } flex items-center gap-2`}
                  >
                    {formData.password === formData.confirmPassword ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewPassword;