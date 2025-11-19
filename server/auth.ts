import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}
