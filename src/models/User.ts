import mongoose, { Schema, model, models } from "mongoose";

export interface IFaceCollection {
  id: string;
  frontUrl: string;
  sideUrl: string;
}

export interface IUser {
  name: string;
  email: string;
  image?: string;
  savedFaces: IFaceCollection[];
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  savedFaces: [{ 
    id: { type: String, required: true },
    frontUrl: { type: String, required: true },
    sideUrl: { type: String, required: true }
  }],
});

const User = models.User || model<IUser>("User", UserSchema);
export default User;
