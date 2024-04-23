import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const healthCheck = async (_req: Request, res: Response) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Server is up and running"));
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

export { healthCheck };
