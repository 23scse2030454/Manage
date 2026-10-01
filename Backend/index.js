
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require("./Product.Routes");
app.use("/api", productRoutes);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI .env file mein nahi mila.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("=========================================");
    console.log("🚀 MongoDB se connection 100% successful!");
    console.log("=========================================");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`📡 Server port ${PORT} par running hai...`);
});

