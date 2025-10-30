import dotenv from "dotenv";
import connectDB from "./app/db";
import { app } from "./app";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.error("MongoDB Connection Refused:", err);
  });
