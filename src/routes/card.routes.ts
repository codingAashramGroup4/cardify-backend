import { Router } from "express";

import { upload } from "../middlewares/multer.middleware";

import { verifyJwt } from "../middlewares/auth.middleware";
import {
  deleteCard,
  getRandomCards,
  getUserCardById,
  publishACard,
  togglePublicStatus,
  updateCardDetails,
} from "../controllers/card.controller";

const router = Router();

router.route("/:cardId").get(getUserCardById);

router.route("/").get(getRandomCards);

//Proctected Route

router
  .route("/:cardId")
  .patch(verifyJwt, upload.single("banner"), updateCardDetails)
  .delete(verifyJwt, deleteCard);

router.route("/toggle/status/:cardId").patch(verifyJwt, togglePublicStatus);

router.route("/publish-card").post(
  verifyJwt,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  publishACard
);

export default router;
