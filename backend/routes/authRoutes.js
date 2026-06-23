import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { signup, login, logout, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);

export default router;
