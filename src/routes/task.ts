import express from "express";
import { startTask } from "../controllers/taskController";

const router = express.Router();

router.post("/", startTask).get("/", startTask);

export default router;
