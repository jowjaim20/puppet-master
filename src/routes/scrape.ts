import express from "express";
import { startTask } from "../controllers/scraperController";

const router = express.Router();

router.post("/", startTask).get("/", startTask);

export default router;
