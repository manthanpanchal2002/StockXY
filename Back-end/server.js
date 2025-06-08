const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./db");
const routes = require("./routes");
const portfolioRoutes = require("./routes/portfolio");
const stockRoutes = require('./routes/stocks');
const dashboardRoutes = require("./routes/dashboard");
const searchRoutes = require("./routes/search");
const chartRoutes = require("./routes/chart");
const companyRoutes = require("./routes/company");
const profileRoutes = require("./routes/profile");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/portfolio", portfolioRoutes); 
app.use('/api/stocks', stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/chart",chartRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
