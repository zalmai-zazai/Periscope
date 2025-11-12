import mongoose, { Document, Schema } from "mongoose";

export interface ILineItemCatalog extends Document {
  code: string;
  description: string;
  unit: string;
  category: string;
  iicrcReference?: string;
  defaultNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // NEW AI Justification fields
  aiJustificationNotes?: string;
  aiIicrcReference?: string;
  aiJustificationSource: "ai" | "manual" | "none";
  aiJustifiedAt?: Date;
}

const LineItemCatalogSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ["sqft", "linear-ft", "each", "hour", "day", "other"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "water-damage",
        "fire-damage",
        "mold",
        "structural",
        "content",
        "equipment",
        "accessories", // ← Make sure this is here
        "demolition", // ← And this
        "cleaning", // ← And this
        "plumbing", // ← And this
        "electrical", // ← And this
        "hvac", // ← And this
        "labor", // ← And this
      ],
    },
    iicrcReference: String,
    defaultNotes: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    aiJustificationNotes: String,
    aiIicrcReference: String,
    aiJustificationSource: {
      type: String,
      enum: ["ai", "manual", "none"],
      default: "none",
    },
    aiJustifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for search
LineItemCatalogSchema.index({ code: 1 });
LineItemCatalogSchema.index({ category: 1 });
LineItemCatalogSchema.index({ description: "text" });
LineItemCatalogSchema.index({
  description: 1,
  aiJustificationSource: 1,
});

export default mongoose.models.LineItemCatalog ||
  mongoose.model<ILineItemCatalog>("LineItemCatalog", LineItemCatalogSchema);
