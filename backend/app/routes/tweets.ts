import express, { Request, Response } from "express";
import { db } from "../db";

const router = express.Router();

// Define an interface for the tweet document
interface ITweet {
  relevant: boolean;
  keyword: string;
  inserted_at: Date;
  // Add other tweet properties here
}

// Fetch tweets where relevant = true
router.get("/relevant", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const keywords = req.query.keywords as string;

    const query: any = { relevant: true };

    if (keywords) {
      const keywordArray = keywords.split(",").map((k) => k.trim());
      query.keyword = { $in: keywordArray };
    }

    const tweets: ITweet[] = await db
      .collection("tweets")
      .find(query)
      .sort({ inserted_at: -1 })
      .limit(limit)
      .toArray();

    res.json(tweets);
  } catch (error) {
    console.error("Error fetching relevant tweets:", error);
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
});

// Fetch all tweets
router.get("/all", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const tweets: ITweet[] = await db
      .collection("tweets")
      .find({})
      .sort({ inserted_at: -1 })
      .limit(limit)
      .toArray();

    res.json(tweets);
  } catch (error) {
    console.error("Error fetching all tweets:", error);
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
});

export default router;
