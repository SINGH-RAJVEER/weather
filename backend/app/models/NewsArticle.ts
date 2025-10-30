import mongoose, { Schema, Document } from "mongoose";

export interface INewsArticle extends Document {
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  url: string;
  category: "breaking" | "update" | "advisory" | "analysis";
  relevanceScore: number;
  location?: string;
}

const NewsArticleSchema: Schema<INewsArticle> = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["breaking", "update", "advisory", "analysis"],
    required: true,
  },
  relevanceScore: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
  },
});

const NewsArticle = mongoose.model<INewsArticle>(
  "NewsArticle",
  NewsArticleSchema
);

export default NewsArticle;
