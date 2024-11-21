import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

router
  .post("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: 200 });
  })
  .get("/", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: 200 });
  });

export default router;
