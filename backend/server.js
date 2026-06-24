import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import meRoutes from "./routes/meRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/organizer", organizerRoutes);
app.use("/events", eventRoutes);          // GET /events, GET /events/:id
app.use("/events", bookingRoutes);        // POST /events/:id/book
app.use("/bookings", bookingRoutes);      // DELETE /bookings/:id
app.use("/me", meRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "BookIt API Running" });
});

const PORT = process.env.PORT || 5000;
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database Connection Failed:", error);
    process.exit(1);
  }
};

startServer();
