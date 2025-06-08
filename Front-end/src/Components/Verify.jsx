import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ArrowRight,
  Mail,
  TrendingUp,
  LineChart,
  Activity,
  PieChart,
  ScatterChart,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [otpData, setOtpData] = useState({
    email: localStorage.getItem("emailid"),
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);
  const [source, setSource] = useState('');

  useEffect(() => {
    // Get the source from localStorage
    const verifySource = localStorage.getItem("verifySource");
    setSource(verifySource || '');
  }, []);

  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpData(prev => ({
      ...prev,
      otp: value
    }));
  };

  const showVerificationNotification = (type) => {
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      if (type === 'success') {
        const verifySource = localStorage.getItem("verifySource");
        if (verifySource === "forgot-password") {
          localStorage.removeItem("verifySource");
          navigate("/create-new-password");
        } else {
          localStorage.removeItem("verifySource");
          navigate("/dashboard");
        }
      }
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otpData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      showVerificationNotification('success');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Notification Overlay */}
      {showNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className={`transform transition-all duration-500 ${showNotification ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            {notificationType === 'success' ? (
              <div className="bg-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-emerald-500/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20"></div>
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 relative z-10 animate-pulse" />
                </div>
                <p className="text-emerald-400 font-semibold text-xl">Verification Successful!</p>
                <p className="text-white/60">
                  {source === 'forgot-password' 
                    ? "Redirecting to create new password..."
                    : "Redirecting to dashboard..."}
                </p>
              </div>
            ) : (
              <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-red-500/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400/20"></div>
                  <XCircle className="w-16 h-16 text-red-400 relative z-10 animate-pulse" />
                </div>
                <p className="text-red-400 font-semibold text-xl">Verification Failed</p>
                <p className="text-white/60">Please check the OTP and try again.</p>
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
            <ShieldCheck className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform hover:scale-[1.01] transition-transform duration-300">
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-center mb-2 animate-fade-in">
                Verify Your Email
              </h2>
              <p className="text-emerald-400 text-center font-medium animate-fade-in-delayed">
                Enter the OTP sent to your email
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* Email Display */}
            <div className="mb-6 flex items-center justify-center gap-2 text-white/80 bg-white/5 p-4 rounded-lg border border-white/10 transform hover:scale-[1.02] transition-transform duration-200">
              <Mail className="h-5 w-5 text-emerald-400" />
              <span className="text-sm font-medium">{otpData.email}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative transform hover:scale-[1.02] transition-transform duration-200">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  One-Time Password (OTP)
                </label>
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type="text"
                    name="otp"
                    id="otp"
                    value={otpData.otp}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10 text-center text-2xl tracking-[1em] font-mono"
                    placeholder="······"
                  />
                </div>
                {otpData.otp && otpData.otp.length < 6 && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Please enter all 6 digits
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otpData.otp.length !== 6}
                className="w-full bg-emerald-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>

              <div className="text-center space-y-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-white/80 hover:text-emerald-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-200 group"
                >
                  Back to Login
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;