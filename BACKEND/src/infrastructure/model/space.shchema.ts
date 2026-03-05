import { Schema, model } from "mongoose";

const SpaceSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const SpaceModel = model("spaces", SpaceSchema);

export default SpaceModel;
