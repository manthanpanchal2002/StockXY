import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  LineChart,
  Building2,
  Building,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const FETCH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
// const FETCH_INTERVAL = 60 * 1000;
const LOCAL_STORAGE_KEY = "dashboardData";
const LAST_FETCH_KEY = "dashboardLastFetch";

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    topGainers: [],
    topLosers: [],
    activeStocks: [],
    largeCap: [],
    midCap: [],
    smallCap: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view the dashboard");
        navigate("/login");
        return;
      }

      const now = Date.now();
      const lastFetch = parseInt(localStorage.getItem(LAST_FETCH_KEY), 10);
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (cachedData && lastFetch && now - lastFetch < FETCH_INTERVAL) {
        setDashboardData(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;
        console.log("Fetched dashboard data:", data);

        const normalizeStock = (stock) => {
          const price = parseFloat(stock.price) || 0;
          const change = parseFloat(stock.changes) || 0;
          const changesPercentage = parseFloat(stock.changesPercentage) || (price ? (change / price) * 100 : 0);
          const marketCap = parseFloat(stock.marketCap) || null;

          return {
            symbol: stock.symbol || stock.ticker || "N/A",
            name: stock.companyName || stock.name || stock.symbol || "Unknown",
            price,
            change,
            changesPercentage,
            marketCap,
          };
        };

        const normalizedData = {
          topGainers: (data.top_gainers || []).slice(0, 2).map(normalizeStock),
          topLosers: (data.top_losers || []).slice(0, 2).map(normalizeStock),
          activeStocks: (data.most_active || []).slice(0, 3).map(normalizeStock),
          largeCap: (data.large_cap || []).slice(0, 1).map(normalizeStock),
          midCap: (data.mid_cap || []).slice(0, 1).map(normalizeStock),
          smallCap: (data.small_cap || []).slice(0, 1).map(normalizeStock),
        };

        setDashboardData(normalizedData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedData));
        localStorage.setItem(LAST_FETCH_KEY, now.toString());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
        if (error.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
          toast.error("Session expired. Please log in again.");
        }
        setDashboardData({
          topGainers: [],
          topLosers: [],
          activeStocks: [],
          largeCap: [],
          midCap: [],
          smallCap: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const handleStockClick = (symbol) => {
    navigate(`/stock/${symbol}`, { state: { from: "/dashboard" } });
  };

  const formatMarketCap = (value) => {
    if (!value) return "N/A";
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toFixed(2);
  };

  const StockCard = ({ stock, hidePercentage = false }) => (
    <div
      onClick={() => handleStockClick(stock.symbol)}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300 border border-white/10 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">{stock.symbol}</h3>
          <p className="text-sm text-white/60">{stock.name}</p>
        </div>
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="text-2xl font-bold text-white">${stock.price.toFixed(6)}</div>
        {!hidePercentage && (
          <div className={`flex items-center ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {stock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span className="ml-1 font-medium">
              {stock.change >= 0 ? "+" : ""}
              {stock.changesPercentage.toFixed(6)}%
            </span>
          </div>
        )}
      </div>
      {stock.marketCap && (
        <div className="text-sm text-white/60 mt-2">Market Cap: {formatMarketCap(stock.marketCap)}</div>
      )}
    </div>
  );

  const MarketCapSection = ({ title, stocks, icon: Icon, bgColor }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} hidePercentage />
        ))}
      </div>
    </div>
  );

  const ActiveStocksTable = ({ stocks }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <LineChart className="w-5 h-5 text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Active Stocks</h2>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-white">
          <thead>
            <tr className="bg-white/5">
              <th className="px-4 py-3 text-left text-sm font-medium">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Price</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Change</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Change %</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr
                key={stock.symbol}
                onClick={() => handleStockClick(stock.symbol)}
                className="border-t border-white/10 hover:bg-white/15 transition-all duration-300 cursor-pointer"
              >
                <td className="px-4 py-3 font-semibold">{stock.symbol}</td>
                <td className="px-4 py-3 text-white/80">{stock.name}</td>
                <td className="px-4 py-3 text-right">${stock.price.toFixed(6)}</td>
                <td className={`px-4 py-3 text-right ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(6)}
                </td>
                <td className={`px-4 py-3 text-right ${stock.changesPercentage >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stock.changesPercentage >= 0 ? "+" : ""}
                  {stock.changesPercentage.toFixed(6)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Top Gainers</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {dashboardData.topGainers.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Top Losers</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {dashboardData.topLosers.map((stock) => (
                <StockCard key={stock.symbol} stock={stock} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MarketCapSection title="Large Cap" stocks={dashboardData.largeCap} icon={Building2} bgColor="bg-blue-500/20" />
          <MarketCapSection title="Mid Cap" stocks={dashboardData.midCap} icon={Building} bgColor="bg-purple-500/20" />
          <MarketCapSection title="Small Cap" stocks={dashboardData.smallCap} icon={CircleDollarSign} bgColor="bg-orange-500/20" />
        </div>
        <div className="mb-8 mt-10">
          <ActiveStocksTable stocks={dashboardData.activeStocks} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
