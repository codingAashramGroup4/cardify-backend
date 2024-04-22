import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const healthCheck = asyncHandler(async (_req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Server is up and running"));
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

export { healthCheck };
