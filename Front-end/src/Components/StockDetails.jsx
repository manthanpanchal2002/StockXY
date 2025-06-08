import React, { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CircleDollarSign,
  LineChart,
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const FETCH_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const LOCAL_STORAGE_KEY = "stockData";
const LAST_FETCH_KEY = "stockLastFetch";

const StockDetail = () => {
  const { symbol: initialSymbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInPortfolio, setIsInPortfolio] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem("token");

  // Fetch company details on mount or symbol change
  useEffect(() => {
    const fetchStockData = async () => {
      if (!isAuthenticated) {
        toast.error("Please log in to view stock details");
        navigate("/login");
        return;
      }

      const now = Date.now();
      const lastFetch = parseInt(localStorage.getItem(LAST_FETCH_KEY), 10);
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (cachedData && lastFetch && now - lastFetch < FETCH_INTERVAL) {
        setStockData(JSON.parse(cachedData));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/company/${initialSymbol}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = response.data;
        console.log("stockdetails",data);

        setStockData({
          symbol: data.symbol || "N/A",
          name: data.companyName || "Unknown",
          currentPrice: parseFloat(data.price) || 0,
          change: parseFloat(data.change) || 0,
          changesPercentage: parseFloat(data.changePercentage) || 0,
          marketCap: parseFloat(data.marketCap) || null,
          beta: data.beta || "N/A",
          lastDividend: parseFloat(data.lastDividend) || "N/A",
          range: data.range || "N/A",
          volume: data.volume || "N/A",
          avgVolume: data.avgVolume || "N/A",
          industry: data.industry || "N/A",
          website: data.website || "N/A",
          description: data.description || "No description available",
          ceo: data.ceo || "N/A",
          sector: data.sector || "N/A",
          country: data.country || "N/A",
          employees: data.fullTimeEmployees || "N/A",
          phone: data.phone || "N/A",
          address: `${data.address || ""}, ${data.city || ""}, ${
            data.state || ""
          }, ${data.zip || ""}`,
          image: data.image || "https://via.placeholder.com/48",
          ipoDate: data.ipoDate || "N/A",
        });
      } catch (error) {
        console.error("Error fetching stock data:", error);
        toast.error("Failed to load stock details");
        setStockData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [initialSymbol, isAuthenticated, navigate]);

  // Check if stock is in portfolio
  useEffect(() => {
    const portfolioStocks = JSON.parse(
      localStorage.getItem("portfolioStocks") || "[]"
    );
    setIsInPortfolio(
      portfolioStocks.some((stock) => stock.symbol === initialSymbol)
    );
  }, [initialSymbol]);

  const formatMarketCap = (value) => {
    if (!value || typeof value !== "number") return "N/A";
    if (value >= 1000000000000) return `${(value / 1000000000000).toFixed(2)}T`;
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    return value.toFixed(2);
  };

  const addToPortfolio = async () => {
    if (!stockData) return;
    if (!isAuthenticated) {
      toast.error("Please log in to add to portfolio");
      return;
    }

    try {
      // Add to backend
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/portfolio`,
        {
          stock_symbol: stockData.symbol,
          shares: 1,
          invested: stockData.currentPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update localStorage
      const portfolioStocks = JSON.parse(
        localStorage.getItem("portfolioStocks") || "[]"
      );
      const newStock = {
        symbol: stockData.symbol,
        name: stockData.name,
        price: stockData.currentPrice,
        shares: 1,
        invested: stockData.currentPrice,
        currentValue: stockData.currentPrice,
        marketCap: stockData.marketCap,
        peRatio: stockData.beta || "N/A",
        week52High: stockData.range ? stockData.range.split("-")[1] : "N/A",
        week52Low: stockData.range ? stockData.range.split("-")[0] : "N/A",
        dividendYield: stockData.lastDividend || "N/A",
      };
      portfolioStocks.push(newStock);
      localStorage.setItem("portfolioStocks", JSON.stringify(portfolioStocks));
      setIsInPortfolio(true);
      toast.success(`${stockData.symbol} added to portfolio!`);
      // navigate("/portfolio");
    } catch (error) {
      console.error("Error adding stock to portfolio:", error);
      toast.error("Failed to add stock to portfolio");
    }
  };

  const removeFromPortfolio = async () => {
    if (!stockData) return;
    if (!isAuthenticated) {
      toast.error("Please log in to modify your portfolio");
      return;
    }

    try {
      // Remove from backend
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        data: { stock_symbol: stockData.symbol },
      });

      // Update localStorage
      const portfolioStocks = JSON.parse(
        localStorage.getItem("portfolioStocks") || "[]"
      ).filter((stock) => stock.symbol !== stockData.symbol);
      localStorage.setItem("portfolioStocks", JSON.stringify(portfolioStocks));
      setIsInPortfolio(false);
      toast.success(`${stockData.symbol} removed from portfolio!`);
    } catch (error) {
      console.error("Error removing stock from portfolio:", error);
      toast.error("Failed to remove stock from portfolio");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">
          Loading stock details...
        </div>
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {stockData ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={stockData.image}
                      alt={stockData.symbol}
                      className="w-12 h-12 rounded-full"
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/48")
                      }
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        {stockData.symbol}
                      </h1>
                      <span className="text-white/60 text-xl">
                        {stockData.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-white">
                      $
                      {stockData.currentPrice
                        ? stockData.currentPrice.toFixed(2)
                        : "N/A"}
                    </span>
                    <div
                      className={`flex items-center ${
                        stockData.change >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {stockData.change >= 0 ? (
                        <ArrowUpRight className="w-6 h-6" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6" />
                      )}
                      <span className="text-xl font-semibold ml-1">
                        {stockData.changesPercentage
                          ? stockData.changesPercentage.toFixed(2)
                          : "0.00"}
                        %
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={isInPortfolio ? removeFromPortfolio : addToPortfolio}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isInPortfolio
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  } text-white`}
                >
                  {isInPortfolio ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  {isInPortfolio ? "Remove from Portfolio" : "Add to Portfolio"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <span className="text-white/60">Market Cap</span>
                  </div>
                  <span className="text-xl font-semibold text-white">
                    {formatMarketCap(stockData.marketCap)}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDollarSign className="w-5 h-5 text-purple-400" />
                    <span className="text-white/60">Beta</span>
                  </div>
                  <span className="text-xl font-semibold text-white">
                    {stockData.beta}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart className="w-5 h-5 text-emerald-400" />
                    <span className="text-white/60">52-Wk Range</span>
                  </div>
                  <span className="text-xl font-semibold text-white">
                    {stockData.range}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDollarSign className="w-5 h-5 text-red-400" />
                    <span className="text-white/60">Dividend</span>
                  </div>
                  <span className="text-xl font-semibold text-white">
                    $
                    {typeof stockData.lastDividend === "number"
                      ? stockData.lastDividend.toFixed(2)
                      : stockData.lastDividend}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Company Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
                  <div>
                    <p>
                      <strong>Sector:</strong> {stockData.sector}
                    </p>
                    <p>
                      <strong>Industry:</strong> {stockData.industry}
                    </p>
                    <p>
                      <strong>CEO:</strong> {stockData.ceo}
                    </p>
                    <p>
                      <strong>Employees:</strong> {stockData.employees}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Country:</strong> {stockData.country}
                    </p>
                    <p>
                      <strong>Address:</strong> {stockData.address}
                    </p>
                    <p>
                      <strong>Phone:</strong> {stockData.phone}
                    </p>
                    <p>
                      <strong>Website:</strong>{" "}
                      <a
                        href={stockData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline"
                      >
                        {stockData.website}
                      </a>
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-white/60">
                  <strong>Description:</strong> {stockData.description}
                </p>
                <p className="mt-2">
                  <strong>IPO Date:</strong> {stockData.ipoDate}
                </p>
              </div>
            </>
          ) : (
            <div className="text-white text-center py-8">
              No stock data available. Please try another symbol.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
