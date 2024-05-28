import { Request, Response } from "express";
import { Appointment } from "../models/appointment.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Card } from "../models/card.model";
import { CustomRequest } from "../middlewares/auth.middleware";
import {
  cardScehamValidation,
  updateCardScehamValidation,
} from "../validations/card.schema";
import {
  deleteFileOnCloudnairy,
  uploadOnCloudinary,
} from "../utils/cloudinary";
import mongoose, { isValidObjectId } from "mongoose";

const getAllUserCard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      throw new ApiError(404, "Not A Valid User Id");
    }

    const allUserCard = await Card.aggregate([
      {
        $match: {
          owner_user_id: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);

    if (!allUserCard) {
      throw new ApiError(404, "No Card Found Against This UserId");
    }

    return res.json(
      new ApiResponse(200, allUserCard, "Fetched All the Card For User")
    );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const getUserCardById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;

    if (!isValidObjectId(cardId)) {
      throw new ApiError(404, "Not A Valid Card Id");
    }
    const card = await Card.findById(cardId);

    if (!card) {
      throw new ApiError(404, "No Card Found Against This CardId");
    }

    return res.json(new ApiResponse(200, card, "Fetched Card Succesfully  "));

    return res.json({});
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const publishACard = asyncHandler(async (req: CustomRequest, res: Response) => {
  try {
    /*
        - get the details from req.body for the card and get req.user?._id from middleware
        - get the logo,banner from req.files
        - upload the images on cloudnairy 
        - after that save and send response
        */

    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(404, "Must Be Login To Publish The Card");
    }

    const result = cardScehamValidation.safeParse(req.body);

    if (!result.success) {
      const publishError =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, publishError, "Not A Valid Data"));
    }

    const { company_about, company_name, company_socials, template_Id } =
      result.data;

    const logoUrlLocalPath = req.files?.logo && req.files?.logo[0]?.path;
    const bannerUrlLocalPath = req.files?.banner && req.files?.banner[0]?.path;

    if (!logoUrlLocalPath || !bannerUrlLocalPath) {
      throw new ApiError(404, "Banner ANd Logo Need To Publish The Card");
    }

    const companyLogo = await uploadOnCloudinary(logoUrlLocalPath);

    if (!companyLogo?.url) {
      throw new ApiError(404, "Something Went Wrong ON Uplaoding Company Logo");
    }

    const companyBanner = await uploadOnCloudinary(logoUrlLocalPath);

    if (!companyBanner?.url) {
      throw new ApiError(
        404,
        "Something Went Wrong ON Uplaoding Company Banner"
      );
    }

    const newCard = await Card.create({
      company_name,
      company_about,
      company_socials,
      company_banner_url: companyBanner?.url,
      company_logo_url: companyLogo?.url,
      template_Id,
      isPublic: true,
      owner_user_id: userId,
    });

    return res.json(
      new ApiResponse(200, newCard, "Succesfully Created The Card")
    );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

const updateCardDetails = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      /*
          -  get req.user?._id from middleware
          - get the company_about ,company_socials,template_Id from req.body
          - get the  company_banner from req.parms and update the cloudnairy delete old one from  cloudnairy
          - after that save and send response
          */

      const userId = req.user?._id;
      if (!userId) {
        throw new ApiError(404, "Must Be Login To Publish The Card");
      }

      const result = updateCardScehamValidation.safeParse(req.body);

      if (!result.success) {
        const updateError =
          result.error?.errors.map((err) => ({
            code: err.code,
            message: err.message,
          })) || [];

        return res
          .status(403)
          .json(new ApiResponse(403, updateError, "Not A Valid Data"));
      }

      const { company_about, company_socials, template_Id } = result.data;

      const { cardId } = req.params;

      const card = await Card.findById(cardId);

      if (!card) {
        throw new ApiError(404, "Unable to get the card or wrong card id");
      }

      if (userId.toString() !== card?.owner_user_id?.toString()) {
        throw new ApiError(
          404,
          "You Are Not Authorized To update the card details"
        );
      }

      const newBannerLocalPath = await req.file?.path;
      const oldBannerUrl = card.company_banner_url;

      const updatedCard = await Card.findByIdAndUpdate(
        cardId,
        {
          $set: {
            company_about: company_about || card.company_about,
            company_socials: company_socials || card.company_socials,
            company_banner_url: newBannerLocalPath
              ? (await uploadOnCloudinary(newBannerLocalPath))?.url
              : card.company_banner_url,
          },
        },
        { new: true }
      );

      if (newBannerLocalPath) {
        if (oldBannerUrl) await deleteFileOnCloudnairy(oldBannerUrl, "image");
      }

      return res.json(
        new ApiResponse(200, updatedCard, "Successfully upload the card")
      );
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

const togglePublicStatus = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    try {
      /*
            -  get req.user?._id from middleware
            - get the req.cardid from req.parms
            - check the req.user?._id is owner of the card
            - after that save and send response
            */

      const { cardId } = req.params;

      if (!isValidObjectId(cardId)) {
        throw new ApiError(404, "Not A Valid Card Id");
      }

      const userId = req.user?._id;

      const card = await Card.findById(cardId);

      if (!card || card?.owner_user_id?.toString() !== userId) {
        throw new ApiError(
          404,
          "Card Not Found Or You Are Not Authorized To toggle the Card  details"
        );
      }

      card.isPublic = !card.isPublic;

      const updateCard = await card.save();

      return res.json(
        new ApiResponse(200, updateCard, "Publishe Status Toggled Successfully")
      );
    } catch (error: any) {
      throw new ApiError(500, error?.message);
    }
  }
);

const deleteCard = asyncHandler(async (req: CustomRequest, res: Response) => {
  try {
    /*
      -  get req.user?._id from middleware
      - get the req.cardId from req.parms
      - compare the userId woth card owner id 
      - after that delete and send response
     */

    const { cardId } = req.params;
    if (!isValidObjectId(cardId)) {
      throw new ApiError(404, "Not A Valid Card Id");
    }

    const userId = req.user?._id;

    const card = await Card.findById(cardId);

    if (!card) {
      throw new ApiError(404, "Unable to get the card or wrong card id");
    }

    if (!card || card?.owner_user_id?.toString() !== userId) {
      throw new ApiError(
        404,
        "Card Not Found Or You Are Not Authorized To toggle the Card  details"
      );
    }

    const deltedCompanyLogo = await deleteFileOnCloudnairy(
      card.comapny_logo_url,
      "image"
    );

    if (deltedCompanyLogo.result !== "ok") {
      throw new ApiError(404, "Unable to Delete  Company Logo ");
    }

    const deltedCompanyBanner = await deleteFileOnCloudnairy(
      card.company_banner_url,
      "image"
    );

    if (deltedCompanyBanner.result !== "ok") {
      throw new ApiError(404, "Unable to Delete  Company Banner ");
    }

    await Card.findByIdAndDelete(cardId);

    return res.json(
      new ApiResponse(200, { status: true }, "Succesfully Delted The Card")
    );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

export {
  getUserCardById,
  getAllUserCard,
  publishACard,
  updateCardDetails,
  togglePublicStatus,
  deleteCard,
};
