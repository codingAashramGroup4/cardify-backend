import mongoose, { Document, Schema } from "mongoose";

export interface Message extends Document {
  card_owner_id?: string;
  card_id?: string;
  name: string;
  message: string;
}

const messageSchema: Schema<Message> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required to send the message"],
    },
    message: {
      type: String,
      required: [true, "Message is required to send the message"],
    },
    card_owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    card_id: {
      type: Schema.Types.ObjectId,
      ref: "Card",
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
