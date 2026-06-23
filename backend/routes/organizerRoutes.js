import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";
import { createEvent, updateEvent, getOrganizerEvents, getEventAttendees, getEventAnalytics, } from "../controllers/eventController.js";

const router = express.Router();

router.post("/events", authMiddleware, authorize("ORGANIZER"), createEvent);
router.patch("/events/:id", authMiddleware, authorize("ORGANIZER"), updateEvent);
router.get("/events", authMiddleware, authorize("ORGANIZER"), getOrganizerEvents);
router.get("/events/:id/attendees", authMiddleware, authorize("ORGANIZER"), getEventAttendees);
router.get("/events/:id/analytics", authMiddleware, authorize("ORGANIZER"), getEventAnalytics);

export default router;