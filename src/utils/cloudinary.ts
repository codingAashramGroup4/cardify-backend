import dotenv from "dotenv";

dotenv.config();

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFileOnCloudnairy = async (
  cloudinaryUrl: string,
  resource_type: string
) => {
  try {
    if (!cloudinaryUrl) {
      return null;
    }
    const public_id = cloudinaryUrl.split("/").pop()?.split(".")[0];

    if (!public_id) {
      return null;
    }

    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type,
    });

    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFileOnCloudnairy };
