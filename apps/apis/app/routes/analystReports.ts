import { AnalystReport, type IAnalystReport } from "@weather/database";
import express, { type Request, type Response } from "express";

const router = express.Router();

// Create analyst report
router.post("/", async (req: Request, res: Response) => {
  console.log("Creating new analyst report", req.body);
  try {
    const report = new AnalystReport(req.body);
    const saved: IAnalystReport = await report.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// get all analyst reports
router.get("/", async (_req: Request, res: Response) => {
  console.log("Fetching analyst reports");
  try {
    const reports: IAnalystReport[] = await AnalystReport.find();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// get approved analyst reports
router.get("/approved", async (_req: Request, res: Response) => {
  console.log("Fetching approved analyst reports from the database");
  try {
    const approvedReports: IAnalystReport[] = await AnalystReport.find({
      isApproved: true,
    });
    res.json(approvedReports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
