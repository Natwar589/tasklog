import { Router } from "express";
import { entryController } from "../controllers/entryController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Apply auth protection middleware to all entry routes
router.use(requireAuth);

router.get("/", entryController.getEntries);
router.get("/date/:date", entryController.getEntryByDate);
router.post("/", entryController.saveEntry);
router.delete("/:id", entryController.deleteEntry);
router.get("/stats/streak", entryController.getStreak);
router.get("/stats/moods", entryController.getMoodStats);

export default router;
