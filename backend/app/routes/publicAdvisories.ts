import express, { Request, Response, NextFunction } from 'express';
import PublicAdvisory, { IPublicAdvisory } from '../models/PublicAdvisory';

const router = express.Router();

// Extend the Express Response object to include the 'advisory' property
interface ResponseWithAdvisory extends Response {
  advisory?: IPublicAdvisory;
}

// GET all advisories
router.get('/', async (req: Request, res: Response) => {
  try {
    const advisories: IPublicAdvisory[] = await PublicAdvisory.find();
    res.json(advisories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single advisory
router.get('/:id', getAdvisory, (req: Request, res: ResponseWithAdvisory) => {
  res.json(res.advisory);
});

// CREATE a new advisory
router.post('/', async (req: Request, res: Response) => {
  const advisory = new PublicAdvisory({
    title: req.body.title,
    content: req.body.content,
    issuedBy: req.body.issuedBy,
    status: req.body.status,
    targetRegions: req.body.targetRegions,
    severityLevel: req.body.severityLevel,
    validUntil: req.body.validUntil,
    attachments: req.body.attachments,
    relatedReportId: req.body.relatedReportId,
  });

  try {
    const newAdvisory: IPublicAdvisory = await advisory.save();
    res.status(201).json(newAdvisory);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE an advisory
router.patch('/:id', getAdvisory, async (req: Request, res: ResponseWithAdvisory) => {
  if (req.body.title != null) {
    res.advisory!.title = req.body.title;
  }
  if (req.body.content != null) {
    res.advisory!.content = req.body.content;
  }
  if (req.body.issuedBy != null) {
    res.advisory!.issuedBy = req.body.issuedBy;
  }
  if (req.body.status != null) {
    res.advisory!.status = req.body.status;
  }
  if (req.body.targetRegions != null) {
    res.advisory!.targetRegions = req.body.targetRegions;
  }
  if (req.body.severityLevel != null) {
    res.advisory!.severityLevel = req.body.severityLevel;
  }
  if (req.body.validUntil != null) {
    res.advisory!.validUntil = req.body.validUntil;
  }
  if (req.body.attachments != null) {
    res.advisory!.attachments = req.body.attachments;
  }
  if (req.body.relatedReportId != null) {
    res.advisory!.relatedReportId = req.body.relatedReportId;
  }
  try {
    const updatedAdvisory = await res.advisory!.save();
    res.json(updatedAdvisory);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an advisory
router.delete('/:id', getAdvisory, async (req: Request, res: ResponseWithAdvisory) => {
  try {
    await res.advisory!.remove();
    res.json({ message: 'Deleted Advisory' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

async function getAdvisory(req: Request, res: ResponseWithAdvisory, next: NextFunction) {
  let advisory: IPublicAdvisory | null;
  try {
    advisory = await PublicAdvisory.findById(req.params.id);
    if (advisory == null) {
      return res.status(404).json({ message: 'Cannot find advisory' });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }

  res.advisory = advisory;
  next();
}

export default router;
