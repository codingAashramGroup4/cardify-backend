import mongoose, { Schema, Document } from "mongoose";

export interface Card extends Document {
  company_name: string;
  comapny_logo_url?: string;
  company_banner_url?: string;
  company_about: string;
  company_socials: string[];
  template_Id: number;
  isPublic: Boolean;
  views: Number;
  owner_user_id?: string;
}

const cardSchema: Schema<Card> = new Schema(
  {
    company_name: {
      type: String,
      required: [true, "Comapny name is required to create the card"],
    },
    comapny_logo_url: {
      type: String,
      required: [true, "Comapny logo is required to create the card"],
    },
    company_banner_url: {
      type: String,
      required: [true, "Comapny banner is required to create the card"],
    },
    company_about: {
      type: String,
      required: [true, "Comapny name is required to create the card"],
    },

    company_socials: [
      {
        type: String,
        required: [true, "At least one social media link is required"],
      },
    ],
    template_Id: {
      type: Number,
      default: 1,
      required: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    owner_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Card = mongoose.model("Card", cardSchema);
