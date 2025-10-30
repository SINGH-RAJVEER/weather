import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IHazardReport extends Document {
  userName: string;
  type:
    | "tsunami"
    | "flooding"
    | "storm_surge"
    | "high_waves"
    | "coastal_current"
    | "coastal_damage"
    | "swell_surge"
    | "other";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: Date;
  media?: string[];
  verified: boolean;
  likes: number;
  comments: number;
  likedBy: IUser["_id"][];
}

const HazardReportSchema: Schema<IHazardReport> = new mongoose.Schema({
  userName: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "tsunami",
      "flooding",
      "storm_surge",
      "high_waves",
      "coastal_current",
      "coastal_damage",
      "swell_surge",
      "other",
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ["critical", "high", "medium", "low"],
    required: true,
  },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  timestamp: { type: Date, default: Date.now },
  media: [String],
  verified: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const HazardReport =
  mongoose.models.HazardReport ||
  mongoose.model<IHazardReport>("HazardReport", HazardReportSchema);

export default HazardReport;
