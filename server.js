const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");
const itemRoutes = require("./src/routes/items.routes");
const companyRoutes = require("./src/routes/company.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Lost Items System Server");
});

// Test endpoint that bypasses the service layer
app.get("/test-db", async (req, res) => {
  try {
    const prisma = require("./src/shared/config/database");
    const count = await prisma.user.count();
    res.json({ success: true, userCount: count });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/companies", companyRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
