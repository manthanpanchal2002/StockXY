import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  TrendingUp,
  LineChart,
  Activity,
  DollarSign,
  ChartScatter,
  ChartPie,
  CheckCircle2,
  XCircle,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validations, setValidations] = useState({
    name: true,
    email: true,
    password: true,
    confirmPassword: true,
  });

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(null);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateName = (name) => {
    return name.length >= 2 && /^[a-zA-Z\s]*$/.test(name);
  };

  const checkPasswordStrength = (password) => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    });
  };

  useEffect(() => {
    if (formData.password) {
      checkPasswordStrength(formData.password);
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate fields as user types
    if (name === "email") {
      setValidations((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "name") {
      setValidations((prev) => ({ ...prev, name: validateName(value) }));
    } else if (name === "confirmPassword") {
      setValidations((prev) => ({
        ...prev,
        confirmPassword: value === formData.password,
      }));
    }
  };

  const showSignupNotification = (type) => {
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      if (type === "success") {
        localStorage.setItem("verifySource", "signup");
        navigate("/verify");
      }
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const newValidations = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: Object.values(passwordChecks).every((check) => check),
      confirmPassword: formData.password === formData.confirmPassword,
    };

    setValidations(newValidations);

    // Check if any validation failed and show specific error
    if (!newValidations.name) {
      toast.error("Please enter a valid name (letters only, min 2 characters)");
      setIsLoading(false);
      return;
    }
    if (!newValidations.email) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (!newValidations.password) {
      toast.error("Password does not meet all requirements");
      setIsLoading(false);
      return;
    }
    if (!newValidations.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (Object.values(newValidations).every((valid) => valid)) {
      // Prepare data for backend (exclude confirmPassword)
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      axios
        .post(`${import.meta.env.VITE_API_BASE_URL}/users`, signupData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          localStorage.setItem("emailid", formData.email);
          showSignupNotification("success");
        })
        .catch((error) => {
          console.error("Error during signup:", error);
          toast.error(
            error.response?.data?.error || "Sign up failed. Please try again."
          );
          showSignupNotification("error");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ satisfied, text }) => (
    <div
      className={`flex items-center gap-2 text-sm ${
        satisfied ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {satisfied ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {showNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div
            className={`transform transition-all duration-500 ${
              showNotification ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {notificationType === "success" ? (
              <div className="bg-emerald-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-emerald-500/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20"></div>
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 relative z-10 animate-pulse" />
                </div>
                <p className="text-emerald-400 font-semibold text-xl">
                  Sign Up Successful!
                </p>
                <p className="text-white/60">Redirecting to verification...</p>
              </div>
            ) : (
              <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl p-8 flex flex-col items-center gap-4 border border-red-500/30">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400/20"></div>
                  <XCircle className="w-16 h-16 text-red-400 relative z-10 animate-pulse" />
                </div>
                <p className="text-red-400 font-semibold text-xl">
                  Sign Up Failed
                </p>
                <p className="text-white/60">
                  Please check all fields and try again.
                </p>
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
        <div className="absolute top-1/3 right-20 text-emerald-500/10 transform rotate-45 animate-float-medium">
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

      <div className="w-full max-w-2xl relative z-10">
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
                Join StockAI Today
              </h2>
              <p className="text-emerald-400 text-center font-medium animate-fade-in-delayed">
                Start Your Trading Journey
              </p>
            </div>
          </div>

          {/* <div className="p-6 sm:px-8 py-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 sm:gap-y-4"
            >
              <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed4">
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
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed6">
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
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 bg-white/5 border ${
                      !validations.password && formData.password
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10`}
                    placeholder="Create password"
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

              <div className="relative transform hover:scale-[1.02] transition-transform impulse duration-200 animate-fade-in-delayed7">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 bg-white/5 border ${
                      !validations.confirmPassword && formData.confirmPassword
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
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
                      validations.confirmPassword
                        ? "text-emerald-400"
                        : "text-red-400"
                    } flex items-center gap-2`}
                  >
                    {validations.confirmPassword ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    {validations.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2 mt-2 animate-fade-in-delayed8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>

              <div className="sm:col-span-2 text-center animate-fade-in-delayed9">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-white/80 hover:text-emerald-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-200 group"
                >
                  Already have an account? Sign In
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </form>
          </div> */}
          <div className="p-6 sm:px-8 py-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 sm:gap-y-4"
            >
              {/* Full Name Field */}
              <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed4">
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
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative transform hover:scale-[1.02] transition-transform duration-200 animate-fade-in-delayed6">
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
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 bg-white/5 border ${
                      !validations.password && formData.password
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10`}
                    placeholder="Create password"
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

              {/* Confirm Password Field */}
              <div className="relative transform hover:scale-[1.02] transition-transform impulse duration-200 animate-fade-in-delayed7">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-white/80 block mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 group-hover:text-emerald-400 transition-colors duration-200 h-5 w-5" />
                  <input
                    type={confirmPasswordVisible ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`pl-10 w-full px-4 py-3 bg-white/5 border ${
                      !validations.confirmPassword && formData.confirmPassword
                        ? "border-red-500/50"
                        : "border-white/10"
                    } rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-white/40 hover:bg-white/10`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
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
                      validations.confirmPassword
                        ? "text-emerald-400"
                        : "text-red-400"
                    } flex items-center gap-2`}
                  >
                    {validations.confirmPassword ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    {validations.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 mt-2 animate-fade-in-delayed8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-500 text-white py-3.5 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>

              {/* Link to Login */}
              <div className="sm:col-span-2 text-center animate-fade-in-delayed9">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-white/80 hover:text-emerald-400 text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-200 group"
                >
                  Already have an account? Sign In
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

export default SignUp;
