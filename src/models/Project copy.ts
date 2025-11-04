import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  address: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  damageType: string;
  description?: string;
  status: "draft" | "submitted" | "in-estimate" | "completed";
  inspectorId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  estimatorId?: mongoose.Types.ObjectId;

  // Timestamps
  submittedAt?: Date;
  estimatedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: String,
    clientPhone: String,
    damageType: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["draft", "submitted", "in-estimate", "completed"],
      default: "draft",
    },
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    estimatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    submittedAt: Date,
    estimatedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
ProjectSchema.index({ companyId: 1, status: 1 });
ProjectSchema.index({ inspectorId: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
