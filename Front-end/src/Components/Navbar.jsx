import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Wallet,
  X,
  BarChart2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const isAuthenticated = !!localStorage.getItem("token") && !!localStorage.getItem("userid");

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "AAPL stock prediction updated",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      message: "MSFT crossed your target price",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "New market analysis available",
      time: "3 hours ago",
      read: true,
    },
  ]);

  const fetchSearchResults = async (query) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const contentType = response.headers["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Expected JSON but received:", contentType);
        console.warn("Response content:", response.data);
        setFilteredStocks([]);
        return;
      }

      const stocks = response.data;
      if (Array.isArray(stocks)) {
        setFilteredStocks(stocks.slice(0, 6));
      } else {
        console.warn("Unexpected search response structure:", stocks);
        setFilteredStocks([]);
      }

      setShowSearchResults(true);
    } catch (error) {
      console.error("Error fetching stock search results:", error);
      setFilteredStocks([]);
      setShowSearchResults(true);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      fetchSearchResults(searchQuery);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleStockSelect = (stock) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/stock/${stock.symbol}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const addToPortfolio = async (stock) => {
    if (!stock) return;
  
    const isAuthenticated = !!localStorage.getItem("token");
    if (!isAuthenticated) {
      toast.error("Please log in to add to portfolio", {
        position: "bottom-right",
        duration: 3000,
        style: {
          background: "rgba(185, 16, 16, 0.1)",
          color: "#f87171",
          border: "1px solid rgba(185, 16, 16, 0.2)",
          padding: "8px 16px",
          borderRadius: "8px",
          maxWidth: "600px",
        },
      });
      return;
    }
  
    try {
      // Check localStorage for duplicates
      const existing = JSON.parse(localStorage.getItem("portfolioStocks") || "[]");
      const alreadyAdded = existing.some((s) => s.symbol === stock.symbol);
      if (alreadyAdded) {
        toast.error(`${stock.symbol} is already in your portfolio`, {
          position: "bottom-right",
          duration: 3000,
          style: {
            background: "rgba(185, 16, 16, 0.1)",
            color: "#f87171",
            border: "1px solid rgba(185, 16, 16, 0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            maxWidth: "600px",
          },
        });
        return;
      }
  
      // Add to backend
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/portfolio`,
        {
          stock_symbol: stock.symbol,
          shares: 0,
          invested: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      // Update localStorage
      const newStock = {
        ...stock,
        shares: 0,
        invested: 0,
        price: stock.price || 0,
        currentValue: 0,
      };
      const updated = [...existing, newStock];
      localStorage.setItem("portfolioStocks", JSON.stringify(updated));
  
      toast.success(`${stock.symbol} added to portfolio`, {
        position: "bottom-right",
        duration: 3000,
        icon: "✅",
        style: {
          background: "rgba(16, 185, 129, 0.2)",
          color: "#10b981",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          padding: "8px 16px",
          borderRadius: "8px",
          maxWidth: "600px",
        },
      });
    } catch (error) {
      console.error("Error adding to portfolio:", error);
      toast.error("Failed to add stock", {
        position: "bottom-right",
        duration: 3000,
        style: {
          background: "rgba(185, 16, 16, 0.1)",
          color: "#f87171",
          border: "1px solid rgba(185, 16, 16, 0.2)",
          padding: "8px 16px",
          borderRadius: "8px",
          maxWidth: "600px",
        },
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target.closest('.notifications-dropdown')) {
        setShowNotifications(false);
      }
      if (!target.closest('.user-menu-dropdown')) {
        setShowUserMenu(false);
      }
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="bg-emerald-500 p-2 rounded-lg cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">StockAI</h1>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate("/portfolio")}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors text-white"
              >
                <Wallet className="w-5 h-5" />
                <span>My Portfolio</span>
              </button>
              <button
                onClick={() => navigate("/prediction")}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors text-white"
              >
                <BarChart2 className="w-5 h-5" />
                <span>Make Prediction</span>
              </button>

              <div className="relative search-container">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-64"
                />

                {showSearchResults && (
                  <div className="absolute left-0 mt-2 w-full bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg max-h-96 overflow-y-auto z-50">
                    <div className="p-2">
                      {Array.isArray(filteredStocks) && filteredStocks.length > 0 ? (
                        filteredStocks.map((stock) => (
                          <div
                            key={stock.symbol}
                            onClick={() => handleStockSelect(stock)}
                            className="p-3 rounded-lg hover:bg-white/15 transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="text-white font-medium">{stock.symbol}</p>
                              <p className="text-white/60 text-sm">{stock.name}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-white/40 text-xs">{stock.exchange}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToPortfolio(stock);
                                }}
                                className="text-xs px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-white/60 text-center">
                          No stocks found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative notifications-dropdown">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-5 h-5 text-white" />
                  {notifications.some((n) => !n.read) && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-semibold">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-white/60 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`p-3 rounded-lg ${notif.read ? 'bg-white/5' : 'bg-white/10'} hover:bg-white/15 transition-colors cursor-pointer`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-white text-sm">{notif.message}</p>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>
                              )}
                            </div>
                            <span className="text-white/40 text-xs mt-1 block">{notif.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative user-menu-dropdown">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-white" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-xl border border-white/10 shadow-lg">
                    <div className="p-2">
                      <button
                        onClick={() => navigate("/settings")}
                        className="w-full flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/prediction")}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors text-white"
              >
                <BarChart2 className="w-5 h-5" />
                <span>Make Prediction</span>
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;