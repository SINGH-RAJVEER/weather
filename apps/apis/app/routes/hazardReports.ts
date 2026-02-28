import { HazardReport, type IHazardReport } from "@weather/database";
import express, { type Request, type Response } from "express";

const router = express.Router();

// Get all hazard reports
router.get("/", async (_req: Request, res: Response) => {
  try {
    const reports: IHazardReport[] = await HazardReport.find();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new hazard report
router.post("/", async (req: Request, res: Response) => {
  console.log("Creating new hazard report", req.body);
  const report = new HazardReport(req.body);
  try {
    const newReport: IHazardReport = await report.save();
    res.status(201).json(newReport);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// POST to like/unlike a hazard report
router.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const report = await HazardReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const userId = req.body.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userLikedIndex = report.likedBy.indexOf(userId);

    if (userLikedIndex === -1) {
      report.likes += 1;
      report.likedBy.push(userId);
    } else {
      report.likes -= 1;
      report.likedBy.splice(userLikedIndex, 1);
    }

    const updatedReport: IHazardReport = await report.save();
    res.json(updatedReport);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
