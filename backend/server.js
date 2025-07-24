const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Import routes
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");
const deckRoutes = require("./routes/deckRoutes");
const flashcardRoutes = require("./routes/flashcardRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const aiLogRoutes = require("./routes/aiLogRoutes");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Smart Study Assistant API" });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/decks", deckRoutes);
app.use("/api", flashcardRoutes);
app.use("/api/studyplans", studyPlanRoutes);
app.use("/api/ai", aiLogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // Listen on all interfaces

// Get network interfaces to show all available IPs
const os = require("os");
const networkInterfaces = os.networkInterfaces();

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on ${HOST}:${PORT}`);
  console.log(`📱 Available endpoints:`);
  console.log(`   Local:     http://localhost:${PORT}`);
  console.log(`   Emulator:  http://10.0.2.2:${PORT}`);

  // Show all network IPs
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach((interface) => {
      if (interface.family === "IPv4" && !interface.internal) {
        console.log(
          `   Network:   http://${interface.address}:${PORT} (${interfaceName})`
        );
      }
    });
  });

  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📚 Test endpoint: http://localhost:${PORT}/api/users/login`);
});
