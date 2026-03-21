import express from "express";
import { saveSession, getSessions, getSession } from "../controllers/sessionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveSession);
router.get("/", authMiddleware, getSessions);
router.get("/:id", authMiddleware, getSession);

export default router;