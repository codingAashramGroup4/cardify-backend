import mongoose from "mongoose";
import { DB_NAME } from "../constant";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}${DB_NAME}`
    );

    console.log(
      `MongoDB Connected the host address is ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Unable to connect to db", error);
    process.exit(1);
  }
};

export default connectDb;
