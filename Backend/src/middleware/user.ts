import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import type { NextFunction, Request, Response } from "express";

export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET || "") as JwtPayload;
    // @ts-ignore
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "You are not Signed In",
    });
  }
};
