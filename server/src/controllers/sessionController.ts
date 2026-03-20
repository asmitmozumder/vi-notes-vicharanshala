import type { Request, Response } from "express";
import Session from "../models/Session.js";

export const saveSession = async (req: Request, res: Response) => {
  try {
    const { content, keystrokes } = req.body;

    if (!content || !keystrokes) {
      return res.status(400).json({ error: "Invalid session data" });
    }

    const session = new Session({
      user: req.userId,
      content,
      keystrokes,
    });
    await session.save();

    res.status(201).json({ message: "Session saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save session" });
  }
};
