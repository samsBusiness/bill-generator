import mongoose, {Schema} from "mongoose";

export interface IUser extends Document {
  _id: object;
  username: string;
  password: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  _id: {type: Schema.Types.ObjectId, auto: true},
  username: {type: String, required: true},
  password: {type: String, required: true},
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
