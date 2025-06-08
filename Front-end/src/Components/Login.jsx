import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  LineChart,
  DollarSign,
  Activity,
  PieChart as ChartPie,
  ScatterChart as ChartScatter,
  KeyRound,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const showLoginNotification = (type) => {
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      if (type === "success") {
        navigate("/dashboard");
      }
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post(`${import.meta.env.VITE_API_BASE_URL}/login`, credentials, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // Assuming your backend returns { message, token, user: { id, name, email } }
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userid", response.data.user.id);
        showLoginNotification("success");
      })
      .catch((error) => {
        console.error("Error during login:", error);
        if (error.response) {
          toast.error(error.response.data.error || "Login failed. Please try again.");
        } else {
          toast.error("An error occurred. Please try again.");
        }
        showLoginNotification("error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
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
                  <p className="text-emerald-400 font-semibold text-xl">Login Successful!</p>
                  <p className="text-white/60">Redirecting to dashboard...</p>
                </div>
              ) : (
                <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-red-500/30">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-400/20"></div>
                    <XCircle className="w-16 h-16 text-red-400 relative z-10 animate-pulse" />
                  </div>
                  <p className="text-red-400 font-semibold text-xl">Login Failed</p>
                  <p className="text-white/60">Invalid credentials. Please try again.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-0 overflow-hidden">
          {/* Floating icons with different animations */}
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
            <ChartPie size={200} />
          </div>
          <div className="absolute top-40 right-100 text-emerald-500/10 transform rotate-20 animate-float-slower">
            <ChartScatter size={170} />
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
              <DollarSign className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 transform hover:scale-[1.01] transition-transform duration-300">
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-800 via-slate-800/95 to-slate-900 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5"></div>
              <div className="relative">
                <h2 className="text-3xl font-bold text-center mb-2 animate-fade-in">
                  Welcome to StockAI
                </h2>
                <p className="text-emerald-400 text-center font-medium animate-fade-in-delayed">
                  Predict. Analyze. Profit.
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white/80 block mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={credentials.email}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed3">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white/80 block mb-2"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      id="password"
                      value={credentials.password}
                      onChange={handleChange}
                      required
                      className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-emerald-400 transition-colors duration-200"
                    >
                      {passwordVisible ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 group animate-fade-in-delayed4"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Access Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <div className="text-center mb-2 animate-fade-in-delayed5">
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="text-white/80 hover:text-emerald-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-200 group"
                    >
                      New to StockAI? Start Trading Today
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>

                  <div className="text-center animate-fade-in-delayed6">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-white/80 hover:text-emerald-400 text-sm font-medium inline-flex items-center gap-2 transition-colors duration-200 group"
                    >
                      Forgot Password
                      <KeyRound className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Animated Market Stats Ticker */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 transform hover:scale-[1.02] transition-transform duration-300 animate-fade-in">
            <div className="flex justify-around text-xs text-white/70">
              <div className="text-center animate-fade-in-delayed3">
                <div className="text-emerald-500 font-semibold animate-pulse">
                  +2.34%
                </div>
                <div>NASDAQ</div>
              </div>
              <div className="text-center animate-fade-in-delayed4">
                <div className="text-emerald-500 font-semibold animate-pulse">
                  +1.89%
                </div>
                <div>S&P 500</div>
              </div>
              <div className="text-center animate-fade-in-delayed5">
                <div className="text-red-500 font-semibold animate-pulse">
                  -0.45%
                </div>
                <div>DOW</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;