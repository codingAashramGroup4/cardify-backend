import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Card } from "../models/card.model";

const getUserCardById = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
      - write a aggregation piplene on the bases of req.user?._id from auth middleware which will get all the card for the user 
      */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const getRandomCards = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
        - send random 4-5 card from this api in repsonse
        */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const publishACard = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
        - get the details from req.body for the card and get req.user?._id from middleware
        - get the logo,banner from req.files
        - upload the images on cloudnairy 
        - after that save and send response
        */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const updateCardDetails = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
          -  get req.user?._id from middleware
          - get the company_about ,company_socials,template_Id from req.body
          - get the  company_banner from req.parms and update the cloudnairy delete old one from  cloudnairy
          - after that save and send response
          */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const togglePublicStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
            -  get req.user?._id from middleware
            - get the req.cardid from req.parms
            - check the req.user?._id is owner of the card
            - after that save and send response
            */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const deleteCard = asyncHandler(async (req: Request, res: Response) => {
  try {
    /*
              -  get req.user?._id from middleware
              - get the req.cardId from req.parms
              - compare the userId woth card owner id 
              - after that delete and send response
              */
    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

export {
  getUserCardById,
  getRandomCards,
  publishACard,
  updateCardDetails,
  togglePublicStatus,
  deleteCard,
};
