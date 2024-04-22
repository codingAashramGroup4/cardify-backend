import dotenv from "dotenv";
import connectDb from "./db";
import { app } from "./app";

dotenv.config();

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 7746, () => {
      console.log(
        `Server is up and running at port:${process.env.PORT || 7746} `
      );
    });

    app.on("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
  })
  .catch((err) => console.log("MongoDb Failed To Connect", err));
