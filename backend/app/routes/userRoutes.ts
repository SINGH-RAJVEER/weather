import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import User from "../models/User";
import { getAuth } from "../utils/auth";

const router = Router();

// Extend the Express Request object to include the 'user' and 'file' properties
interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req: AuthRequest, file: any, cb: any) => {
    cb(null, "./uploads/profilePictures"); // Directory for profile pictures
  },
  filename: (req: AuthRequest, file: any, cb: any) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Profile picture upload route
router.post("/profile-picture", (req: AuthRequest, res: Response, next: NextFunction) => getAuth().middleware()(req, res, next), upload.single("profilePicture"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: "Profile picture updated successfully.", profilePicture: user.profilePicture });
  } catch (error: any) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ error: "Failed to upload profile picture." });
  }
});

export default router;
