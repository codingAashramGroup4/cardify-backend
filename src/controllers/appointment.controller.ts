import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose, { isValidObjectId } from "mongoose";
import { appointmentScehamValidation } from "../validations/appointment.schema";
import { CustomRequest } from "../middlewares/auth.middleware";

const getUserAppointment = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      /*
      - write a aggregation piplene on the bases of req.user?._id from auth middleware which will get all the appointment fot the user 
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

      const getMessage = await Appointment.aggregate([
        {
          $match: {
            card_owner_id: new mongoose.Types.ObjectId(userId),
          },
        },
      ]);

      if (!getMessage) {
        throw new ApiError(404, "No Appointment Found");
      }

      return res.json(
        new ApiResponse(
          200,
          getMessage,
          "Fetched All the Apppointment For User"
        )
      );
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

const sendAppointmentToUser = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      /*
        - get  Card_id , card_owner_id from query
        - get name, description, appointment_date_time , meet link from req.body
        - validate the date should not before the current date Ask Frontend also to validate

        - save to db
        */

      const { card_id, card_owner_id } = req.query;
      const result = appointmentScehamValidation.safeParse(req.body);

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
        const appointmentError =
          result.error?.errors.map((err) => ({
            code: err.code,
            message: err.message,
          })) || [];

        return res
          .status(403)
          .json(new ApiResponse(403, appointmentError, "Not A Valid Data"));
      }

      const { name, description, appointment_date_time, meet_link } =
        result.data;

      const isAppointmentAllowed = await User.findById(card_owner_id);

      if (!isAppointmentAllowed?.isAcceptingAppointment) {
        return res
          .status(405)
          .json(new ApiError(405, "Card Owner is Not Accepting Appointment"));
      }

      const saveAppointement = await Appointment.create({
        name,
        description,
        appointment_date_time,
        meet_link,
        card_owner_id,
        card_id,
      });

      if (!saveAppointement) {
        throw new ApiError(
          500,
          "Something Went Wrong During The Booking Of Appointment"
        );
      }

      return res
        .status(200)
        .json(new ApiResponse(200, "Succesfully Send The Appointment"));
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

const toggleAppointment = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      /*
          - get req.user?._id from auth middleware
          - toggle the isAcceptingAppointment from user model
  
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

      user.isAcceptingAppointment = !user.isAcceptingAppointment;

      const updatedUser = await user.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedUser.isAcceptingMessage,
            "Toggled The Appointment Status Success"
          )
        );
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

export { getUserAppointment, sendAppointmentToUser, toggleAppointment };
