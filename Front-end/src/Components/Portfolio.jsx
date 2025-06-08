import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowLeft,
  X,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const FETCH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const LOCAL_STORAGE_KEY = "portfolioStocks";
const LAST_FETCH_KEY = "portfolioLastFetch";

const Portfolio = () => {
  const navigate = useNavigate();
  const [portfolioStocks, setPortfolioStocks] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioGain, setPortfolioGain] = useState(0);
  const [portfolioCost, setPortfolioCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem("token");

  const fetchPortfolioData = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to view your portfolio");
      navigate("/login");
      return;
    }

    const now = Date.now();
      const lastFetch = parseInt(localStorage.getItem(LAST_FETCH_KEY), 10);
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (cachedData && lastFetch && now - lastFetch < FETCH_INTERVAL) {
        setPortfolioStocks(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

    setIsLoading(true);
    try {
      // Fetch live portfolio data from backend
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/portfolio/live`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const liveData = response.data.message === "No stocks in portfolio" ? [] : response.data;
      console.log("portfolio",liveData);

      // Fetch portfolio stocks from localStorage as a fallback or for additional data
      const localStocks = JSON.parse(localStorage.getItem("portfolioStocks") || "[]");

      // Merge live data with local data (prioritize backend data)
      const mergedStocks = liveData.map((liveStock) => {
        const localStock = localStocks.find((s) => s.symbol === liveStock.symbol) || {};
        return {
          symbol: liveStock.symbol || localStock.symbol,
          name: liveStock.name || localStock.name || "Unknown",
          price: parseFloat(liveStock.price) || localStock.price || 0,
          change: parseFloat(liveStock.change) || localStock.change || 0,
          changesPercentage: parseFloat(liveStock.changesPercentage) || localStock.changesPercentage || 0,
          marketCap: parseFloat(liveStock.marketCap) || localStock.marketCap || 0,
          shares: parseInt(localStock.shares) || 1,
          invested: parseFloat(localStock.invested) || liveStock.price || 0,
          currentValue: (parseFloat(liveStock.price) || 0) * (parseInt(localStock.shares) || 1),
          peRatio: liveStock.pe || localStock.peRatio || "N/A",
          week52High: liveStock.yearHigh || localStock.week52High || "N/A",
          week52Low: liveStock.yearLow || localStock.week52Low || "N/A",
          dividendYield: liveStock.dividendYield || localStock.dividendYield || "N/A",
        };
      });

      // Include any local stocks not yet synced with backend
      const unsyncedLocalStocks = localStocks.filter(
        (localStock) => !liveData.some((liveStock) => liveStock.symbol === localStock.symbol)
      );
      mergedStocks.push(...unsyncedLocalStocks.map((localStock) => ({
        ...localStock,
        price: localStock.price || 0,
        change: localStock.change || 0,
        changesPercentage: localStock.changesPercentage || 0,
        marketCap: localStock.marketCap || 0,
        shares: localStock.shares || 1,
        invested: localStock.invested || localStock.price || 0,
        currentValue: (localStock.price || 0) * (localStock.shares || 1),
        peRatio: localStock.peRatio || "N/A",
        week52High: localStock.week52High || "N/A",
        week52Low: localStock.week52Low || "N/A",
        dividendYield: localStock.dividendYield || "N/A",
      })));

      setPortfolioStocks(mergedStocks);

      // Calculate totals
      const totalValue = mergedStocks.reduce((acc, stock) => acc + stock.currentValue, 0);
      const totalInvested = mergedStocks.reduce((acc, stock) => acc + stock.invested, 0);
      setPortfolioValue(totalValue);
      setPortfolioGain(totalValue - totalInvested);
      setPortfolioCost(totalInvested);

      // Update localStorage with merged data
      localStorage.setItem("portfolioStocks", JSON.stringify(mergedStocks));
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      toast.error("Failed to load portfolio data");
      // Fallback to localStorage if backend fails
      const localStocks = JSON.parse(localStorage.getItem("portfolioStocks") || "[]");
      setPortfolioStocks(localStocks.map((stock) => ({
        ...stock,
        price: stock.price || 0,
        change: stock.change || 0,
        changesPercentage: stock.changesPercentage || 0,
        marketCap: stock.marketCap || 0,
        shares: stock.shares || 1,
        invested: stock.invested || stock.price || 0,
        currentValue: (stock.price || 0) * (stock.shares || 1),
      })));
      const totalValue = localStocks.reduce((acc, stock) => acc + (stock.price || 0) * (stock.shares || 1), 0);
      const totalInvested = localStocks.reduce((acc, stock) => acc + (stock.invested || 0), 0);
      setPortfolioValue(totalValue);
      setPortfolioGain(totalValue - totalInvested);
      setPortfolioCost(totalInvested);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
    const interval = setInterval(fetchPortfolioData, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const removeFromPortfolio = async (symbol) => {
    if (!isAuthenticated) {
      toast.error("Please log in to modify your portfolio");
      return;
    }

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: { stock_symbol: symbol },
      });

      const updatedStocks = portfolioStocks.filter((stock) => stock.symbol !== symbol);
      setPortfolioStocks(updatedStocks);
      localStorage.setItem("portfolioStocks", JSON.stringify(updatedStocks));

      toast.success(`${symbol} removed from portfolio`);
    } catch (error) {
      console.error("Error removing stock:", error);
      toast.error("Failed to remove stock");
    }
  };

  const viewStockDetails = (symbol) => {
    navigate(`/stock/${symbol}`);
  };

  const portfolioComposition = {
    labels: portfolioStocks.map((stock) => stock.symbol),
    datasets: [
      {
        data: portfolioStocks.map((stock) => stock.currentValue),
        backgroundColor: [
          "rgba(16, 185, 129, 0.6)",
          "rgba(59, 130, 246, 0.6)",
          "rgba(236, 72, 153, 0.6)",
          "rgba(245, 158, 11, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const performanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolioStocks.length
          ? [
              portfolioCost * 0.9,
              portfolioCost * 0.95,
              portfolioCost * 0.93,
              portfolioCost * 1.02,
              portfolioCost * 1.05,
              portfolioValue,
            ]
          : [0, 0, 0, 0, 0, 0],
        borderColor: "rgb(16, 185, 129)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "rgba(255, 255, 255, 0.8)" },
      },
    },
    scales: {
      y: { grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "rgba(255, 255, 255, 0.8)" } },
      x: { grid: { color: "rgba(255, 255, 255, 0.1)" }, ticks: { color: "rgba(255, 255, 255, 0.8)" } },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading portfolio data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <Toaster />
      <div className="max-w-7xl mx-auto mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Portfolio</h1>
              <div className="text-4xl font-bold text-white">${portfolioValue.toFixed(2)}</div>
              <div className={`flex items-center mt-2 ${portfolioGain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {portfolioGain >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                <span className="ml-1">
                  ${Math.abs(portfolioGain).toFixed(2)} (
                  {portfolioCost > 0 ? ((portfolioGain / portfolioCost) * 100).toFixed(2) : "0.00"}%)
                </span>
              </div>
              <div className="text-white/60 mt-2">Total Cost: ${portfolioCost.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Portfolio Composition</h3>
              </div>
              <div className="h-80">
                <Pie data={portfolioComposition} options={chartOptions} />
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
              </div>
              <div className="h-80">
                <Line data={performanceData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Holdings</h2>
          <div className="space-y-4">
            {portfolioStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => viewStockDetails(stock.symbol)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{stock.symbol}</h3>
                        <p className="text-white/60">{stock.name}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(stock.symbol);
                        }}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-white/60 text-sm">Shares</p>
                        <p className="text-white font-medium">{stock.shares}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Avg. Price</p>
                        <p className="text-white font-medium">${(stock.invested / stock.shares).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Current Value</p>
                        <p className="text-white font-medium">${stock.currentValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Gain/Loss</p>
                        <p
                          className={`font-medium ${
                            stock.currentValue - stock.invested >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          ${Math.abs(stock.currentValue - stock.invested).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Change %</p>
                        <p
                          className={`font-medium ${
                            stock.changesPercentage >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {stock.changesPercentage.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Market Cap</p>
                        <p className="text-white font-medium">{formatMarketCap(stock.marketCap)}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">P/E Ratio</p>
                        <p className="text-white font-medium">{stock.peRatio}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">Dividend Yield</p>
                        <p className="text-white font-medium">{stock.dividendYield}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {portfolioStocks.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">
                  Your portfolio is empty. Start by adding some stocks from the dashboard or stock details!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format market cap
const formatMarketCap = (value) => {
  if (!value || typeof value !== "number") return "N/A";
  if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(2)}T`;
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  return value.toFixed(2);
};

export default Portfolio;