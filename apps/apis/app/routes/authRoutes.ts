import crypto from "node:crypto";
import { db, type IUser, User } from "@weather/database";
import bcrypt from "bcryptjs";
import { type Request, type Response, Router } from "express";
import { getAuth } from "../utils/auth";

const router = Router();

router.get("/test", (_req: Request, res: Response) => {
  res.send("test route is working");
});

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await db.collection("user").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = crypto.randomUUID();

    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || "",
      role: role || "citizen",
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("user").insertOne(user);

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = {
      id: crypto.randomUUID(),
      userId,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("session").insertOne(session);

    res.status(201).json({
      message: "User created successfully",
      userId,
      token: sessionToken,
      user: {
        id: userId,
        email,
        name: name || "",
        role: role || "citizen",
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message || "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await db.collection<IUser>("user").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = {
      id: crypto.randomUUID(),
      userId: user.id,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("session").insertOne(session);

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.put("/user/:userId", async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, role } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { name, role });
    res.status(200).json({ message: "User profile updated successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put(
  "/profile",
  (req: Request, res: Response, next: any): any => getAuth().middleware()(req, res, next),
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    const userId = (req as any).user.id;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.name = name || user.name;
      user.email = email || user.email;

      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profilePicture: user.profilePicture, // Include profile picture in response
        },
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

export default router;
