import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyBookings } from "../controllers/bookingController.js";

const router = express.Router();

router.get("/bookings", authMiddleware, getMyBookings);

export default router;