import { type INewsArticle, NewsArticle } from "@weather/database";
import express, { type Request, type Response } from "express";

const router = express.Router();

// Get all news articles
router.get("/", async (req: Request, res: Response) => {
  try {
    const { location } = req.query;
    let filter = {};

    if (location) {
      // Assuming location is in format "City, State, Country" or similar, extract state from the location string
      const parts = String(location)
        .split(",")
        .map((s) => s.trim());
      let state: string | null = null;
      if (parts.length >= 2) {
        state = parts[parts.length - 2];
      } else if (parts.length === 1) {
        state = parts[0];
      }

      if (state) {
        filter = { location: { $regex: new RegExp(state, "i") } };
      }
    }

    const articles: INewsArticle[] = await NewsArticle.find(filter);
    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
