import { type Db, MongoClient } from "mongodb";
import mongoose from "mongoose";

const mongoClient = new MongoClient(process.env.MONGODB_URI!);
let db: Db;

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    await mongoClient.connect();
    db = mongoClient.db(process.env.DB_NAME);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export { mongoClient, db };
export default connectDB;
