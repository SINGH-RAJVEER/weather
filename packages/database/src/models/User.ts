import mongoose, { type Document, type Schema } from "mongoose";

// Interface for the User document
export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  role: "citizen" | "official" | "analyst";
  profilePicture?: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["citizen", "official", "analyst"],
    required: true,
  },
  profilePicture: {
    type: String,
    default: null,
  },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.password;
  },
});

userSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    delete ret._id;
    delete ret.password;
  },
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
