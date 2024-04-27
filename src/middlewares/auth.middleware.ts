import jwt, { JwtPayload } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { NextFunction, Request, Response } from "express";

export interface CustomRequest extends Request {
  user?: User; // Define the user property
}

export const verifyJwt = async (
  req: CustomRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    const verifyedToken = (await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    )) as JwtPayload;

    const userId = verifyedToken?._id;

    const user = await User.findById(userId).select(
      "-password -refreshToken -verifyCode -verifyCodeExpiry"
    );

    if (!user) {
      throw new ApiError(405, "Invalid Access Token");
    }

    if (!user.isVerified) {
      throw new ApiError(
        403,
        "User Not Verified Please Signup Again To Verify"
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    next(error)
    
  }
};
