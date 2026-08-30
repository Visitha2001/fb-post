import mongoose, { Schema, model, models } from "mongoose";

export interface IPost {
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  language: string;
  style: string;
  clothing: string;
  aspectRatio: string;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  language: { type: String, required: true },
  style: { type: String, required: true },
  clothing: { type: String, required: true },
  aspectRatio: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Post = models.Post || model<IPost>("Post", PostSchema);
export default Post;
