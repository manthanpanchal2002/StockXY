import React, { useState, useEffect } from "react";
import {
  Mail,
  User,
  Lock,
  Save,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Settings = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    profile: {
      id: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "", // Frontend-only field for validation
    },
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfile = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view settings");
        navigate("/login");
        return;
      }

      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const userData = response.data.user;
          setSettings({
            profile: {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              password: "",
              confirmPassword: "",
            },
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile data");
          setLoading(false);
        });
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = (e) => {
    if (!isEditing) return;
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value,
      },
    }));
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to save changes");
      navigate("/login");
      return;
    }

    // Validate confirm password on frontend only
    if (settings.profile.password && settings.profile.password !== settings.profile.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    const updateData = {
      name: settings.profile.name,
      email: settings.profile.email,
      password: settings.profile.password || undefined, // Only send if changed
    };

    axios
      .put(`${import.meta.env.VITE_API_BASE_URL}/users/${settings.profile.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        toast.success("Settings saved successfully!", {
          duration: 3000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            borderRadius: "0.5rem",
            padding: "1rem",
          },
          icon: "🎉",
        });
        setIsEditing(false);
        setSettings((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            password: "", // Clear password fields after save
            confirmPassword: "",
          },
        }));
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
        toast.error(error.response?.data?.error || "Failed to save settings");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isEditing
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={loading}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                Edit Info
              </>
            )}
          </button>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">
              Profile Settings
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-white/60 text-base mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/40" />
                  <input
                    type="text"
                    name="name"
                    value={settings.profile.name}
                    onChange={handleProfileUpdate}
                    disabled={!isEditing}
                    className={`w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      !isEditing && "opacity-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-base mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/40" />
                  <input
                    type="email"
                    name="email"
                    value={settings.profile.email}
                    onChange={handleProfileUpdate}
                    disabled={!isEditing}
                    className={`w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      !isEditing && "opacity-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-base mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/40" />
                  <input
                    type="password"
                    name="password"
                    value={settings.profile.password}
                    onChange={handleProfileUpdate}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Enter new password" : "••••••••"}
                    className={`w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      !isEditing && "opacity-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/60 text-base mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/40" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={settings.profile.confirmPassword}
                    onChange={handleProfileUpdate}
                    disabled={!isEditing}
                    placeholder={isEditing ? "Confirm new password" : "••••••••"}
                    className={`w-full bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      !isEditing && "opacity-50 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;