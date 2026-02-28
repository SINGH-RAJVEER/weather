import {
  AnalystReport,
  connectDB,
  db,
  HazardReport,
  mongoClient,
  NewsArticle,
  PublicAdvisory,
} from "@weather/database";
import { initializeAuth } from "./utils/auth";

const initDB = async () => {
  await connectDB();
  initializeAuth(db);
};

export { initDB, AnalystReport, HazardReport, NewsArticle, PublicAdvisory, mongoClient, db };

export default initDB;
