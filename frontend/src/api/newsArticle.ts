import { NewsArticle } from "../types/types";

const API_URL = "http://localhost:3000/api/news-articles";

// Accept either a full address string or an object with address
export const getNewsArticles = async (
  location?: string | { address: string } | null
): Promise<NewsArticle[]> => {
  let url = API_URL;
  const addr = typeof location === "string" ? location : location?.address;
  if (addr) {
    url += `?location=${encodeURIComponent(addr)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch news articles");
  }
  return response.json();
};
