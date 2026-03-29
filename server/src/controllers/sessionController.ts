import type { Request, Response } from "express";
import { Types } from "mongoose";
import Session from "../models/Session.js";

export const saveSession = async (req: Request, res: Response) => {
  try {
    const { content, keystrokes, title } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({ error: "content must be a string" });
    }

    if (!Array.isArray(keystrokes)) {
      return res.status(400).json({ error: "keystrokes must be an array" });
    }

    const session = new Session({
      user: new Types.ObjectId(req.userId),
      title: typeof title === "string" ? title : "",
      content,
      keystrokes,
    });
    await session.save();

    res.status(201).json({ message: "Session saved", sessionId: session._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save session" });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid session id" });
    }

    const { content, keystrokes, title } = req.body;

    const update: Record<string, unknown> = {
      $push: { keystrokes: { $each: keystrokes ?? [] } },
    };

    const setFields: Record<string, unknown> = {};
    if (typeof content === "string") setFields.content = content;
    if (typeof title === "string") setFields.title = title;
    if (Object.keys(setFields).length > 0) update.$set = setFields;

    const session = await Session.findOneAndUpdate(
      { _id: new Types.ObjectId(id), user: new Types.ObjectId(req.userId) },
      update,
      { returnDocument: "after" }
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({ message: "Session updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update session" });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const sessions = await Session.find({ user: new Types.ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .select("-__v -keystrokes");

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve sessions" });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: "Invalid session id" });
    }

    const session = await Session.findOne({
      _id: new Types.ObjectId(id),
      user: new Types.ObjectId(req.userId),
    }).select("-__v");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve session" });
  }
};