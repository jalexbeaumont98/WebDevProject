// server/db.js
import mongoose from "mongoose";

let connected = false;

export async function connectDB(uri) {
  if (connected) return;
  await mongoose.connect(uri);
  connected = true;
  console.log("✅ Mongo connected");
}