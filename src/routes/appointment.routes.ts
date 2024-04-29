import { Router } from "express";

import { verifyJwt } from "../middlewares/auth.middleware";
import {
  getUserAppointment,
  sendAppointmentToUser,
  toggleAppointment,
} from "../controllers/appointment.controller";

const router = Router();

router
  .route("/user/sendappointment/:cardId/:card_owner_id")
  .post(sendAppointmentToUser);

//Proctected Route

router.route("/user/appointment").get(verifyJwt, getUserAppointment);
router.route("/user/toggle/appointment").patch(verifyJwt, toggleAppointment);

export default router;
