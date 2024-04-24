import { Router } from "express";

import { upload } from "../middlewares/multer.middleware";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  signUpUser,
  updateUserAccountDetails,
  updateUserAvatar,
  verifyOtp,
  forgotPassword,
} from "../controllers/user.controller";
import { verifyJwt } from "../middlewares/auth.middleware";

const router = Router();

router.route("/register").post(upload.single("avatar"), signUpUser);
router.route("/verify-code").post(verifyOtp);

router.route("/login").post(loginUser);

router.route("/forgot-password").post(forgotPassword);

//protected -route
router.route("/logout").post(verifyJwt, logoutUser);

router.route("/getCurrentUser").get(verifyJwt, getCurrentUser);
router
  .route("/update-account-details")
  .get(verifyJwt, updateUserAccountDetails);

router
  .route("/update-user-avatar")
  .post(upload.single("avatar"), updateUserAvatar);

export default router;
