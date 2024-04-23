import mongoose, { Schema, Document } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export interface User extends Document {
  username: string;
  email: string;
  avatar_url?: string;
  password: string;
  about: string;
  socialMedia?: string[];
  profile_bg_color?: string;
  verifyCode: String;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  isAcceptingAppointment: boolean;
  refreshToken?: string;
}

const userSchema: Schema<User> = new Schema(
  {
    username: {
      tpye: String,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
      required: [true, "User name is requrired"],
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Email is requrired"],
    },

    password: {
      type: String,
      required: [true, "User name is requrired"],
    },

    socialMedia: {
      type: [String],
      default: [],
    },

    avatar_url: {
      type: String,
      required: [true, "Avatar is Required To Create the profile"],
    },

    about: {
      type: String,
    },

    profile_bg_color: {
      type: String,
      default: "#EAF0F1",
      required: [true, "Give the profile bg color"],
    },

    verifyCode: {
      type: String,
      required: [true, "User name is requrired"],
    },

    verifyCodeExpiry: {
      type: Date,
      required: [true, "Verify Code Expiry is required"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    isAcceptingMessage: {
      type: Boolean,
      default: false,
    },
    isAcceptingAppointment: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcryptjs.compare(password, this.password);
};

userSchema.methods.genrateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFERESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFERESH_TOKEN_EXPIRY }
  );
};
export const User = mongoose.model("User", userSchema);
