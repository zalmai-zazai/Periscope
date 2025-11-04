import mongoose, { Document, Schema } from "mongoose";

export interface IArea extends Document {
  name: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  totalArea?: number;
  unit: "feet" | "meters";
  photos: string[];
  projectId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // NEW: Damage Assessment Fields
  damageCategory: "1" | "2" | "3";
  damageClass: "1" | "2" | "3" | "4";
  containmentNeeded: boolean;
  materialsAffectedPercent: number;

  // NEW: Equipment Calculation Results
  recommendedEquipment?: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
    isManualOverride: boolean;
    originalCalculation?: {
      airMovers: number;
      lgrDehumidifiers: number;
      hepaAirScrubbers: number;
    };
  };
  equipmentRuleVersion: string;
  lastCalculatedAt?: Date;
}

const AreaSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    length: Number,
    width: Number,
    height: Number,
    totalArea: Number,
    unit: {
      type: String,
      enum: ["feet", "meters"],
      default: "feet",
    },
    photos: [String],
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

    // NEW: Damage Assessment Fields
    damageCategory: {
      type: String,
      enum: ["1", "2", "3"],
      default: "2",
    },
    damageClass: {
      type: String,
      enum: ["1", "2", "3", "4"],
      default: "2",
    },
    containmentNeeded: {
      type: Boolean,
      default: false,
    },
    materialsAffectedPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    // NEW: Equipment Calculation Results
    recommendedEquipment: {
      airMovers: { type: Number, default: 0 },
      lgrDehumidifiers: { type: Number, default: 0 },
      hepaAirScrubbers: { type: Number, default: 0 },
      isManualOverride: { type: Boolean, default: false },
      originalCalculation: {
        airMovers: { type: Number, default: 0 },
        lgrDehumidifiers: { type: Number, default: 0 },
        hepaAirScrubbers: { type: Number, default: 0 },
      },
    },
    equipmentRuleVersion: {
      type: String,
      default: "v1.0",
    },
    lastCalculatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Calculate totalArea before saving
AreaSchema.pre("save", function (next) {
  if (this.length && this.width) {
    this.totalArea = Number(this.length ?? 0) * Number(this.width ?? 0);
  }
  next();
});

// Indexes for better performance
AreaSchema.index({ projectId: 1 });
AreaSchema.index({ companyId: 1 });

export default mongoose.models.Area ||
  mongoose.model<IArea>("Area", AreaSchema);
