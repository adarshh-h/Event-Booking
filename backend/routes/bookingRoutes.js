import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { bookEvent, cancelBooking } from "../controllers/bookingController.js";

const router = express.Router();

// POST /events/:id/book
router.post("/:id/book", authMiddleware, bookEvent);

// DELETE /bookings/:id
router.delete("/:id", authMiddleware, cancelBooking);

export default router;
