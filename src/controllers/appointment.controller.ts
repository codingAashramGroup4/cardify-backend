import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const getUserAppointment = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
      - write a aggregation piplene on the bases of req.user?._id from auth middleware which will get all the appointment fot the user 
      */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const sendAppointmentToUser = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      /*
        - get  Card_id , card_owner_id from parmas
        - get name, description, appointment_date_time , meet link from req.body
        - validate the date should not before the current date Ask Frontend also to validate

        - save to db
        */
      return res.json({});
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

const toggleAppointment = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
          - get req.user?._id from auth middleware
          - toggle the isAcceptingAppointment from user model
  
      */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

export { getUserAppointment, sendAppointmentToUser, toggleAppointment };
