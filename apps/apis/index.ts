import dotenv from "dotenv";
import { app } from "./app";
import { initDB } from "./app/db";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

initDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.error("MongoDB Connection Refused:", err);
  });
