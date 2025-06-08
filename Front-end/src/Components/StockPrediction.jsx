import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  LineChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockPrediction = () => {
  const navigate = useNavigate();
  const [predictionData, setPredictionData] = useState(null);
  const [filteredStockData, setFilteredStockData] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    time_step: "100",
    future_days: "30",
  });

  const isAuthenticated = !!localStorage.getItem("token");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchPrediction = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to get predictions");
      return;
    }

    if (!formData.symbol) {
      toast.error("Please enter a stock symbol");
      return;
    }

    setIsPredicting(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_MODEL_BASE_URL}/predict`,
        {
          symbol: formData.symbol.toUpperCase(),
          time_step: formData.time_step,
          future_days: formData.future_days,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      // Flatten nested prediction arrays
      const predictions = (data.prediction || []).map((val) =>
        Array.isArray(val) ? val[0] : val
      );

      setPredictionData({
        symbol: data.symbol,
        predictions: predictions,
        confidence: data.confidence,
      });

      const filteredData = data.filtered_data || [];
      setFilteredStockData(
        filteredData.map((item) => ({
          date: item.date,
          open: parseFloat(item.open) || 0,
          high: parseFloat(item.high) || 0,
          low: parseFloat(item.low) || 0,
          close: parseFloat(item.close) || 0,
          volume: parseInt(item.volume) || 0,
        }))
      );

      toast.success("Prediction and stock data loaded successfully!");
    } catch (error) {
      console.error("Error fetching prediction:", error);
      toast.error("Failed to generate prediction");
      setPredictionData(null);
      setFilteredStockData([]);
    } finally {
      setIsPredicting(false);
    }
  };

  const predictionChartData = useMemo(() => {
    if (!predictionData || !predictionData.predictions) {
      return { labels: [], datasets: [] };
    }

    const labels = Array.from(
      { length: predictionData.predictions.length },
      (_, i) => `Day ${i + 1}`
    );

    const gradient = document.createElement('canvas').getContext('2d');
    const gradientFill = gradient.createLinearGradient(0, 0, 0, 400);
    gradientFill.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
    gradientFill.addColorStop(1, 'rgba(52, 211, 153, 0.05)');

    return {
      labels,
      datasets: [
        {
          label: `${predictionData.symbol} Price Prediction`,
          data: predictionData.predictions,
          borderColor: "rgb(52, 211, 153)",
          borderWidth: 2,
          backgroundColor: gradientFill,
          pointBackgroundColor: "rgb(52, 211, 153)",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "rgb(52, 211, 153)",
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [predictionData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { 
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 14,
            weight: 'bold'
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            return [
              `Price: $${value.toFixed(2)}`,
              `Change: ${((value - context.dataset.data[0]) / context.dataset.data[0] * 100).toFixed(2)}%`
            ];
          },
        },
      },
    },
    scales: {
      y: {
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: { 
          color: "rgba(255, 255, 255, 0.8)",
          callback: (value) => `$${value.toFixed(2)}`,
          font: {
            size: 12
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: { 
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: { 
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            size: 12
          }
        },
        border: {
          display: false
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

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
          <h1 className="text-3xl font-bold text-white mb-6">Stock Price Prediction</h1>

          {/* Prediction Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-white/60 mb-1">Stock Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                placeholder="e.g., AAPL"
              />
            </div>
            <div>
              <label className="block text-white/60 mb-1">Time Step (Days)</label>
              <input
                type="number"
                name="time_step"
                value={formData.time_step}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                min="1"
                placeholder="e.g., 100"
              />
            </div>
            <div>
              <label className="block text-white/60 mb-1">Future Days</label>
              <input
                type="number"
                name="future_days"
                value={formData.future_days}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white"
                min="1"
                placeholder="e.g., 30"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchPrediction}
                className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
                disabled={isPredicting}
              >
                {isPredicting ? "Predicting..." : "Get Prediction"}
              </button>
            </div>
          </div>

          {/* Prediction Chart */}
          {isPredicting ? (
            <div className="h-[500px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white animate-pulse">Generating prediction...</p>
              </div>
            </div>
          ) : predictionData ? (
            <div className="mb-8">
              <div className="h-[500px] relative">
                <Line data={predictionChartData} options={chartOptions} />
                {predictionData.confidence && (
                  <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                    <p className="text-white/80 text-sm font-medium">
                      Model Confidence
                    </p>
                    <p className="text-emerald-400 text-2xl font-bold">
                      {(predictionData.confidence * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center text-white/60">
              <div className="text-center">
                <LineChart className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p>Enter details and click "Get Prediction" to see the forecast.</p>
              </div>
            </div>
          )}

          {/* Filtered Stock Data Table */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Filtered Stock Data</h3>
            {filteredStockData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Open</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">High</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Low</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Close</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStockData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-t border-white/10 hover:bg-white/15 transition-all duration-300"
                      >
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3 text-right">${row.open.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${row.high.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${row.low.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${row.close.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{row.volume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-white/60 text-center py-4">
                No filtered stock data available. Generate a prediction to view data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPrediction;