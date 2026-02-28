import mongoose, { type Document, type Schema } from "mongoose";

export interface IPublicAdvisory extends Document {
  title: string;
  content: string;
  issuedBy: string;
  issuedAt: Date;
  status: "draft" | "published" | "archived";
  targetRegions: string[];
  severityLevel: "info" | "warning" | "emergency";
  validUntil?: Date;
  attachments: string[];
  relatedReportId?: string;
}

const PublicAdvisorySchema: Schema<IPublicAdvisory> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  issuedBy: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  targetRegions: {
    type: [String],
    default: [],
  },
  severityLevel: {
    type: String,
    enum: ["info", "warning", "emergency"],
    default: "info",
  },
  validUntil: {
    type: Date,
  },
  attachments: {
    type: [String],
    default: [],
  },
  relatedReportId: {
    type: String,
  },
});

const PublicAdvisory =
  mongoose.models.PublicAdvisory ||
  mongoose.model<IPublicAdvisory>("PublicAdvisory", PublicAdvisorySchema);

export default PublicAdvisory;
