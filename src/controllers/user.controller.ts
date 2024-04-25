import { ApiError } from "../utils/ApiError";
import {
  forgatePasswordSchemaValidation,
  singUpSchemaValidation,
  updateUserSchemaValidation,
  userSchemaValidation,
  verifyOtpSchemaValidation,
} from "../validations/user.schema";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/user.model";
import { sendVerificationEmail } from "../utils/sendVerifficationEmail";
import {
  deleteFileOnCloudnairy,
  uploadOnCloudinary,
} from "../utils/cloudinary";
import { ObjectId } from "mongoose";
import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/auth.middleware";

const genrateAccessAndRefreshToken = async (userId: ObjectId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong during the genration of the access and refresh token"
    );
  }
};

const signUpUser = async (req: Request, res: Response) => {
  /*
     1) get the data from the req parse it throw validation if validation error throw error
     2) check if existing username and email exist in db with isVerified :true if found throw error
     3) Now 2 case :1)found but not verified 2) not found
     4) if found then check it status of verified
     5)genrate otp/verifyCode
     6)if found wat true then check it status if true then throw error else update the details of the user like password verifyCode and verifCOdeExipry
     7)else in notfound create the user 
     8) send otp/verifycode in both case

    */
  try {
    const result = singUpSchemaValidation.safeParse(req.body);

    if (!result.success) {
      const singUpErrors =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(200, singUpErrors, "Not A Valid Data"));
    }

    const { username, email, password, socialMedia, about, profile_bg_color } =
      result.data;

    // check dose username alredy taken

    const existingVerifiedUsername = await User.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUsername) {
      throw new ApiError(402, "Username Already Taken");
    }

    // now 2 case if not verified but have its email there in db ,else new user

    const existingUserEmail = await User.findOne({
      email,
    });

    // genrate otp
    const verifyCode = Math.floor(100000 + Math.random() * 90000).toString();

    if (existingUserEmail) {
      if (existingUserEmail.isVerified) {
        throw new ApiError(402, "Your Email is Verified Already");
      } else {
        // now user exist but not verified so send verification email also no need to update the avatar here

        const avatarLocalPath = req.file?.path;

        if (!avatarLocalPath) {
          throw new ApiError(
            400,
            "Avatar  must be needed to create your profile"
          );
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        existingUserEmail.username = username;
        existingUserEmail.avatar_url = avatar?.url;
        existingUserEmail.about = about || " ";
        existingUserEmail.socialMedia = socialMedia;
        existingUserEmail.profile_bg_color = profile_bg_color;
        existingUserEmail.password = password;
        existingUserEmail.verifyCode = verifyCode;
        existingUserEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserEmail.save();
      }
    } else {
      const verifyCodeExpiryDate = new Date();
      verifyCodeExpiryDate.setHours(verifyCodeExpiryDate.getHours() + 1);

      // send verification email
      const mailSend = await sendVerificationEmail(email, username, verifyCode);

      if (!mailSend) {
        return res
          .status(403)
          .json(
            new ApiResponse(
              403,
              { success: false },
              "Unable to send you mail check your email id"
            )
          );
      }

      const avatarLocalPath = req.file?.path;

      if (!avatarLocalPath) {
        throw new ApiError(
          400,
          "Avatar  must be needed to create your profile"
        );
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath);

      await User.create({
        username,
        email,
        password,
        avatar_url: avatar?.url,
        socialMedia,
        about,
        profile_bg_color,
        verifyCode,
        verifyCodeExpiry: verifyCodeExpiryDate,
        isVerified: false,
        isAcceptingMessage: false,
        isAcceptingAppointment: true,
      });
    }

    return res.status(200).json(
      new ApiResponse(
        403,
        {
          success: true,
          user: {
            username: username,
          },
        },
        "User Registered Succesfully ! Kindly Verify Your Email "
      )
    );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const verifyOtp = async (req: Request, res: Response) => {
  try {
    const result = verifyOtpSchemaValidation.safeParse(req.body);

    if (!result.success) {
      const verifyOtpErrors =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, verifyOtpErrors, "Not A Valid Data"));
    }

    const { username, verifyCode } = result.data;

    // const username = req.params?.username;
    // const forgatePassword = req.params?.forgatePassword;

    const user = await User.findOne({
      username,
    });

    if (!user) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            { success: false },
            "No User Found with this username"
          )
        );
    }

    const isCodeValid = user.verifyCode === verifyCode;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeNotExpired && isCodeValid) {
      user.isVerified = true;
      await user.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            success: true,
            data: {
              email: user.email,
              username: user.username,
            },
          },
          "User Verified Succesfully"
        )
      );
    } else if (!isCodeNotExpired) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            { success: false },
            "Verification Code Has Exiperd Please Singup again to get a new Code"
          )
        );
    } else {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            { success: false },
            "Incorrect Verification Code"
          )
        );
    }
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = userSchemaValidation.safeParse(req.body);
    if (!result.success) {
      const singInErrors =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, singInErrors, "Not A Valid Data"));
    }

    const { username, email, password } = result.data;

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(400, "User Dosenot Exist");
    }

    if (!user.isVerified) {
      throw new ApiError(403, "User Not Verified Please Signup Again");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      throw new ApiError(401, "Check Your Password Is Incorrect");
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -verifyCode -verifyCodeExpiry"
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as "none",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, loggedInUser, "User Logged In Successfully"));
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const logoutUser = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          refreshToken: 1, // this will remove the field from document [was geting undefine in refreshToken Db]
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as "none",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new ApiResponse(200, { success: true }, "User Logout  Successfully")
      );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const genrateOptForValidEmail = async (req: CustomRequest, res: Response) => {
  try {
    const result = forgatePasswordSchemaValidation.safeParse(req.body);
    if (!result.success) {
      const forgatePassErrors =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, forgatePassErrors, "Not A Valid Data"));
    }

    const { email } = result.data;
    if (!email) {
      throw new ApiError(408, "Email Field is Required ");
    }

    const existingUserByEmail = await User.findOne({ email });

    if (!existingUserByEmail) {
      throw new ApiError(404, "Email Not Found");
    }

    if (!existingUserByEmail.isVerified) {
      throw new ApiError(404, "User is not verified please singup again");
    }

    // genrate otp
    const verifyCode = Math.floor(100000 + Math.random() * 90000).toString();

    const verifyCodeExpiryDate = new Date();
    verifyCodeExpiryDate.setHours(verifyCodeExpiryDate.getHours() + 1);

    // send verification email
    const mailSend = await sendVerificationEmail(
      existingUserByEmail.email,
      existingUserByEmail.username,
      verifyCode
    );

    if (!mailSend) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            { success: false },
            "Unable to send you mail check your email id"
          )
        );
    }

    existingUserByEmail.verifyCode = verifyCode;
    existingUserByEmail.verifyCodeExpiry = verifyCodeExpiryDate;

    await existingUserByEmail.save({ validateBeforeSave: false });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          success: true,
          data: {
            email: existingUserByEmail.email,
            username: existingUserByEmail.username,
          },
        },
        "Email Is Valid Opt is Genrated Check Your Email"
      )
    );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const forgotPassword = async (req: CustomRequest, res: Response) => {
  try {
    const result = forgatePasswordSchemaValidation.safeParse(req.body);
    if (!result.success) {
      const forgatePassErrors =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, forgatePassErrors, "Not A Valid Data"));
    }

    const { email, oldPassword, newPassword } = result.data;

    if (!email) {
      throw new ApiError(408, "Email Field is Required ");
    }

    const existingUserByEmail = await User.findOne({ email });

    if (!existingUserByEmail) {
      throw new ApiError(404, "Email Not Found");
    }
    const isCodeNotExpired =
      new Date(existingUserByEmail.verifyCodeExpiry) > new Date();
    if (!existingUserByEmail.isVerified) {
      throw new ApiError(404, "User is not verified please singup again");
    } else if (!isCodeNotExpired) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            { success: false },
            "Verification Code Has Exiperd Please Singup again to get a new Code"
          )
        );
    } else {
      if (!oldPassword || !newPassword) {
        throw new ApiError(500, "OldPassword & NewPassword  Field Requred");
      }

      const isOldPasswordCorrect =
        await existingUserByEmail.isPasswordCorrect(oldPassword);

      if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Old Password Is Not Correct");
      }

      existingUserByEmail.password = newPassword;

      await existingUserByEmail.save({ validateBeforeSave: false });

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { succes: true, username: existingUserByEmail.username },
            "Password Update Succesfully"
          )
        );
    }
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const getCurrentUser = async (req: CustomRequest, res: Response) => {
  try {
    return res
      .status(200)
      .json(
        new ApiResponse(200, req.user, "User Details Fetched Successfully")
      );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const updateUserAccountDetails = async (req: CustomRequest, res: Response) => {
  try {
    const result = updateUserSchemaValidation.safeParse(req.body);
    if (!result.success) {
      const updateUserErrors =
        result.error?.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(403)
        .json(new ApiResponse(403, updateUserErrors, "Not A Valid Data"));
    }

    const { about, socialMedia } = result.data;

    if (!about || !socialMedia) {
      throw new ApiError(403, "For Update Details One field is required");
    }

    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User Not Found");
    }

    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          about,
          socialMedia,
        },
      },
      { new: true }
    ).select("-password -refreshToken -verifyCode -verifyCodeExpiry");

    return res
      .status(200)
      .json(
        new ApiResponse(200, updateUser, "Account Details Update Succesfully")
      );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

const updateUserAvatar = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const avatarLocalPath = req?.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(404, "No Avatar Uploaded || Avatar File Missing");
    }
    const oldUser = await User.findById(userId);

    if (!oldUser) {
      throw new ApiError(400, "No User Found by this id ");
    }

    const oldAvatarCloudnaryUrl = oldUser.avatar_url;

    if (!oldAvatarCloudnaryUrl) {
      throw new ApiError(505, "Old Avatar not found");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Error while uploading the avatar try again");
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar_url: avatar.url,
        },
      },
      { new: true }
    );

    const response = await deleteFileOnCloudnairy(
      oldAvatarCloudnaryUrl,
      "image"
    );

    if (response.result !== "ok") {
      throw new ApiError(500, "Failed To Delete old file on CLoudinary");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "update user avatar succesesfully"));
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
};

export {
  signUpUser,
  verifyOtp,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserAccountDetails,
  updateUserAvatar,
  forgotPassword,
  genrateOptForValidEmail,
};
