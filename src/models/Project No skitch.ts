import mongoose, { Document, Schema } from "mongoose";

export interface IProject extends Document {
  name: string;
  address: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  damageType: string;
  description?: string;

  // UPDATED: New workflow states with Mitigation Tech stage
  status:
    | "draft"
    | "needs_field_review"
    | "field_in_progress"
    | "ready_for_estimate"
    | "estimating"
    | "sent";

  // UPDATED: Added mitTechId to track mitigation tech assignments
  inspectorId: mongoose.Types.ObjectId;
  mitTechId?: mongoose.Types.ObjectId; // NEW FIELD
  estimatorId?: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;

  // Timestamps for each workflow stage
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  estimatedAt?: Date;
  completedAt?: Date;

  // NEW: Timestamps for each new workflow stage
  needsFieldReviewAt?: Date;
  fieldInProgressAt?: Date;
  readyForEstimateAt?: Date;
  estimatingAt?: Date;
  sentAt?: Date;
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

    // UPDATED STATUS ENUM: Added the new workflow states
    status: {
      type: String,
      enum: [
        "draft",
        "needs_field_review",
        "field_in_progress",
        "ready_for_estimate",
        "estimating",
        "sent",
      ],
      default: "draft",
    },

    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NEW FIELD: Mitigation Tech assignment
    mitTechId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    estimatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Existing timestamps
    submittedAt: Date,
    estimatedAt: Date,
    completedAt: Date,

    // NEW TIMESTAMPS: For tracking each workflow stage
    needsFieldReviewAt: Date,
    fieldInProgressAt: Date,
    readyForEstimateAt: Date,
    estimatingAt: Date,
    sentAt: Date,
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Indexes for better query performance
ProjectSchema.index({ companyId: 1, status: 1 });
ProjectSchema.index({ inspectorId: 1 });
ProjectSchema.index({ mitTechId: 1 }); // NEW INDEX
ProjectSchema.index({ estimatorId: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project ||
  mongoose.model<IProject>("Project", ProjectSchema);
