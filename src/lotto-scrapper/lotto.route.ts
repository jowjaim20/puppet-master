import express, { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { startTask1 } from "../controllers/taskController";
import { startTask } from "./lotto.controller";

const router = express.Router();

router
  .post("/", [
    check("index", "index is required").notEmpty(),
    (req: Request, res: Response, next: NextFunction) => {
      const error = validationResult(req);
      if (error.isEmpty()) {
        next();
      } else {
        res.status(500).json(error);
      }
    },
    startTask
  ])
  .get("/", startTask);

export default router;
