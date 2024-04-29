import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware";
import {
  getUserMessage,
  sendMessageToUser,
  toggleMessage,
} from "../controllers/message.controller";

const router = Router();

router
  .route("/user/sendmessage/:cardId/:card_owner_id")
  .post(sendMessageToUser);

//Proctected Route

router.route("/user/message").get(verifyJwt, getUserMessage);
router.route("/user/toggle/message").patch(verifyJwt, toggleMessage);

export default router;
