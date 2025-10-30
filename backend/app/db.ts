import mongoose from "mongoose";
import AnalystReport from "./models/AnalystReport";
import HazardReport from "./models/HazardReport";
import NewsArticle from "./models/NewsArticle";
import PublicAdvisory from "./models/PublicAdvisory";
import { MongoClient, Db } from "mongodb";
import { initializeAuth } from "./utils/auth";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);
let db: Db;

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    await mongoClient.connect();
    db = mongoClient.db(process.env.DB_NAME);

    initializeAuth(db);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export {
  AnalystReport,
  HazardReport,
  NewsArticle,
  PublicAdvisory,
  mongoClient,
  db,
};

export default connectDB;
