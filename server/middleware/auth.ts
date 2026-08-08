import { clerkClient } from "@clerk/express";
import { NextFunction, Request, Response } from "express";

export interface AuthenticationRequest extends Request {
  auth?: { userId: string; [key: string]: any };
}

export const protectAdmin = async (
  req: AuthenticationRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.auth?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }
    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata?.role !== "admin") {
      res.status(403).json({ success: false, message: "Not authorized!" });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
};
