import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import zod from "zod";

const app = express();

app.use(express.json());

const signUpSchema = zod.object({
  username: zod.string().min(3, "Username must be at least 3 characters long"),
  password: zod
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

app.post("/api/v1/signup", async (req, res) => {
  try {
    const validateData = signUpSchema.parse(req.body);
    const { username, password } = validateData;
  } catch (error) {}
});

app.post("/api/v1/signin", (req, res) => {});

app.post("/api/v1/content", (req, res) => {});

app.get("/api/v1/signup", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL || "");
    app.listen(process.env.PORT, () => {
      console.log("Server is running on port " + process.env.PORT);
    });
  } catch (error) {
    console.error("Error connecting to the database", error);
  }
}
