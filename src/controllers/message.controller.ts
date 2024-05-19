import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";
import { messageScehamValidation } from "../validations/message.schema";
import mongoose, { isValidObjectId } from "mongoose";
import { CustomRequest } from "../middlewares/auth.middleware";

const getUserMessage = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      /*
    - write a aggregation piplene on the bases of req.user?._id from auth middleware
    */

      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(404)
          .json(
            new ApiError(
              404,
              "User Must Be Login To Toggle The Message Request"
            )
          );
      }

      const getMessage = await Message.aggregate([
        {
          $match: {
            card_owner_id: new mongoose.Types.ObjectId(userId),
          },
        },
      ]);

      if (!getMessage) {
        throw new ApiError(404, "No Message Found");
      }

      return res.json(
        new ApiResponse(200, getMessage, "Fetched All the Messaged For User")
      );
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

const sendMessageToUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
        - get  CardId , card_owner_id from query
        - get name, message from req.boyd
        - check is card_owner allowed the message
        - save to db
        */

    const { card_id, card_owner_id } = req.query;
    const result = messageScehamValidation.safeParse(req.body);

    if (isValidObjectId(card_id) || isValidObjectId(card_owner_id)) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            309,
            "Not A Valid ObjectId of CardId Or Card_owner_id"
          )
        );
    }

    if (!result.success) {
      console.log("Body if not result success");
      const messageError =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, messageError, "Not A Valid Data"));
    }

    const { name, message } = result.data;

    const isMessageAllowed = await User.findById(card_owner_id);

    if (!isMessageAllowed?.isAcceptingMessage) {
      return res
        .status(405)
        .json(new ApiError(405, "Card Owner is Not Accepting Message"));
    }

    const saveMessage = await Message.create({
      name,
      message,
      card_owner_id,
      card_id,
    });

    if (!saveMessage) {
      throw new ApiError(500, "Message Not Sent");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Succesfully Send The Message"));
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const toggleMessage = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      /*
        - get req.user?._id from auth middleware
        - toggle the isAcceptingMessage from user model

    */

      const userId = req.user?._id;

      if (!userId) {
        return res
          .status(404)
          .json(
            new ApiError(
              404,
              "User Must Be Login To Toggle The Message Request"
            )
          );
      }

      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(404)
          .json(new ApiError(404, "No User Found With This Id"));
      }

      user.isAcceptingMessage = !user.isAcceptingMessage;

      const updatedUser = await user.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedUser.isAcceptingMessage,
            "Toggled The Message Status Success"
          )
        );
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

export { getUserMessage, sendMessageToUser, toggleMessage };
