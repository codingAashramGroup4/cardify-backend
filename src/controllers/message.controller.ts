import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";

const getUserMessage = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
    - write a aggregation piplene on the bases of req.user?._id from auth middleware
    */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const sendMessageToUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
        - get  CardId , card_owner_id from parmas
        - get name, message from req.boyd
        - save to db
        */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const toggleMessage = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
        - get req.user?._id from auth middleware
        - toggle the isAcceptingMessage from user model

    */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

export { getUserMessage, sendMessageToUser, toggleMessage };
