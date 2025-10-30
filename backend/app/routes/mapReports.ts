import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

function getRandomSubset<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => Math.random());
    return shuffled.slice(0, size);
}

router.get("/", (req: Request, res: Response) => {
    const filePath = path.join(process.cwd(), 'data', 'data.json');
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const randomHazards = getRandomSubset(data, 40);
    res.json(randomHazards);
});

export default router;
