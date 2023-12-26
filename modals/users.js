import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    passwordtoken: String,
    tokenexpiry: Date,
  },
  { timestamps: true }
);

const UserModel = model("User", UserSchema);

export default UserModel;
