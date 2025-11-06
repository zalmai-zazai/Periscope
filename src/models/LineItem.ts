import mongoose, { Document, Schema } from "mongoose";

export interface ILineItem extends Document {
  name: string;
  itemCode?: string;
  unit: string;
  quantity: number;
  notes?: string;
  iicrcReference?: string;
  photos: string[];

  // Cost Tracking fields
  unitCost?: number; // Price per unit (e.g., $2.50 per sqft)
  totalCost?: number; // Auto-calculated (quantity × unitCost)
  costAddedBy?: mongoose.Types.ObjectId;
  costAddedAt?: Date;

  areaId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;

  // AI Justification fields
  justification?: string;
  justificationSource: "ai" | "manual";
  justificationModel?: string;
  justificationVersionedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    itemCode: {
      // ← ADD THIS SECTION
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["sqft", "linear-ft", "each", "hour", "day", "other"],
      default: "each",
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    notes: String,
    iicrcReference: String,
    photos: [String],

    // Cost Tracking fields
    unitCost: Number, // Price per unit
    totalCost: Number, // Auto-calculated total
    costAddedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    costAddedAt: Date,

    areaId: {
      type: Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // AI Justification fields
    justification: String,
    justificationSource: {
      type: String,
      enum: ["ai", "manual"],
      default: "manual",
    },
    justificationModel: String,
    justificationVersionedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
LineItemSchema.index({ areaId: 1 });
LineItemSchema.index({ projectId: 1 });
LineItemSchema.index({ companyId: 1 });

export default mongoose.models.LineItem ||
  mongoose.model<ILineItem>("LineItem", LineItemSchema);
