import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

import app from "./app.js";
import mongoose from "mongoose";

const PORT = 5000;

mongoose.connect("mongodb://127.0.0.1:27017/vi-notes")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);