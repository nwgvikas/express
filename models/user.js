import mongoose, { Schema } from "mongoose";

/**
 * Site customers — MongoDB collection name: `users`
 * (explicit third arg so data always lands in the `users` table/collection).
 */


const UserSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    /** Indian 10-digit (normalized) — public register; sparse unique for purane users bina mobile. */
    mobile: { type: String, trim: true, sparse: true, unique: true },
    /** `"admin"` users may sign in at `/backoffice/login`. */
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    about: { type: String, trim: true, default: "" },
    profileURL: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema, "users");
