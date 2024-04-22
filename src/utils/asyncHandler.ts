import { Request, Response, NextFunction } from "express";

type fnHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<Response>;

const asyncHandler =
  (fn: fnHandler) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export { asyncHandler };
