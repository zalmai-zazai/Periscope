import mongoose, { Document, Schema } from "mongoose";

export interface IInvite extends Document {
  email: string;
  companyId: mongoose.Types.ObjectId;
  role: "admin" | "project-manager" | "inspector" | "estimator";
  token: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "project-manager", "inspector", "estimator"],
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
InviteSchema.index({ email: 1, companyId: 1 });
InviteSchema.index({ token: 1 });
InviteSchema.index({ status: 1 });

export default mongoose.models.Invite ||
  mongoose.model<IInvite>("Invite", InviteSchema);
