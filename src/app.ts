import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "25kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));

app.use(cookieParser());

// file import

import healthcheckRouter from "./routes/healthcheck.routes";
import userRoute from "./routes/user.routes";

app.use("/api/v1/healthCheck", healthcheckRouter);
app.use("/api/v1/users", userRoute);

export { app };
