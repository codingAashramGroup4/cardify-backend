import mongoose, { Document, Schema } from "mongoose";

export interface Appointment extends Document {
  card_owner_id?: string;
  card_id?: string;
  name: string;
  description: string;
  appointment_date_time: Date;
  meet_link: string;
}

const appointmentSchema: Schema<Appointment> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required to book the appointment"],
    },
    description: {
      type: String,
      required: [
        true,
        "Descrition about the appointment is required to book the appointment",
      ],
    },

    appointment_date_time: {
      type: Date,
      required: [true, "Appointment Date is required to book the appointment"],
    },

    meet_link: {
      type: String,
      required: [true, "Meet Link is required to book the appointment"],
    },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
