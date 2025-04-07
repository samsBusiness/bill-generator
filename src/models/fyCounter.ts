import mongoose from "mongoose";

export interface FYCounterDocument extends Document {
  _id: string; // Financial year e.g. "24-25"
  seq: number;
}

const fyCounterSchema = new mongoose.Schema({
  _id: {type: String, required: true},
  seq: {type: Number, default: 0},
});

export const FYCounterModel =
  mongoose.models.FYCounter || mongoose.model("FYCounter", fyCounterSchema);
