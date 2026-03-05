import { Schema, model } from "mongoose";

const ReservationSchema = new Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    spaceId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    reservationDate: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    reservationReason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    reservationType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReservationModel = model("reservations", ReservationSchema);

export default ReservationModel;
