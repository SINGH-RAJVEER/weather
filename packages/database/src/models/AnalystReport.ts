import mongoose, { type Document, type Schema } from "mongoose";
import type { IHazardReport } from "./HazardReport";

export interface IAnalystReport extends Document {
  analystId: string;
  analystName: string;
  title: string;
  summary: string;
  details?: string;
  relatedHazards: IHazardReport["_id"][];
  recommendations?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  isApproved: boolean;
}

const AnalystReportSchema: Schema<IAnalystReport> = new mongoose.Schema({
  analystId: { type: String, required: true },
  analystName: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, required: true },
  details: { type: String },
  relatedHazards: [{ type: mongoose.Schema.Types.ObjectId, ref: "HazardReport" }],
  recommendations: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  attachments: [String],
  isApproved: { type: Boolean, default: false },
});

const AnalystReport =
  mongoose.models.AnalystReport ||
  mongoose.model<IAnalystReport>("AnalystReport", AnalystReportSchema);

export default AnalystReport;
