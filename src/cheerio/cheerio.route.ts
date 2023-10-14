import express, { Request, Response, NextFunction } from "express";
import { startTask } from "./cheerio.controller";
import { check, validationResult } from "express-validator";
import { startTask1 } from "../controllers/taskController";

const router = express.Router();

router
  .post("/", [
    check("link", "Link is required").notEmpty(),
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
