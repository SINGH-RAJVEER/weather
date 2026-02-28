import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { type Application, type NextFunction, type Request, type Response } from "express";
import connectDB from "./app/db";
import analystReportsRouter from "./app/routes/analystReports";
import authRouter from "./app/routes/authRoutes";
import hazardReportsRouter from "./app/routes/hazardReports";
import mapReports from "./app/routes/mapReports";
import newsArticlesRouter from "./app/routes/newsArticles";
import publicAdvisoriesRouter from "./app/routes/publicAdvisories";
import tweetsRouter from "./app/routes/tweets";
import userRoutes from "./app/routes/userRoutes";

dotenv.config({
  path: "./.env",
});

const app: Application = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

connectDB()
  .then(() => {
    app.use("/api/auth", authRouter);
    app.use("/api/analyst-reports", analystReportsRouter);
    app.use("/api/hazard-reports", hazardReportsRouter);
    app.use("/api/news-articles", newsArticlesRouter);
    app.use("/api/advisories", publicAdvisoriesRouter);
    app.use("/api/mapReports", mapReports);
    app.use("/api/tweets", tweetsRouter);
    app.use("/api/user", userRoutes);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error("Failed to connect to database or start server:", error);
    process.exit(1);
  });

interface AuthRequest extends Request {
  user?: any;
  session?: any;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const token = authHeader.substring(7);

    const { db } = await import("./app/db");
    const session = await db.collection("session").findOne({
      token: token,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized - Invalid or expired token" });
    }

    // Get user data
    const user = await db.collection("user").findOne({ id: session.userId });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }

    req.session = session;
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Unauthorized - Auth error" });
  }
};

app.get("/api/user/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      res.json({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { app };
