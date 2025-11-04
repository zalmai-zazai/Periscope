import mongoose, { Document, Schema } from "mongoose";

export interface ICompany extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  joinCode: string;
  isActive: boolean;
  allowInspectorsCreateProjects: boolean;
  allowEstimatorsEditSubmitted: boolean;
  allowEstimatorsCreateProjects: boolean;
  // Subscription fields for future billing
  subscription: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "suspended" | "cancelled";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    trialEndsAt?: Date;
  };

  // Super admin controls
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspensionReason?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    joinCode: {
      type: String,
      // unique: true,
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    allowInspectorsCreateProjects: {
      type: Boolean,
      default: true,
    },
    allowEstimatorsEditSubmitted: {
      type: Boolean,
      default: false,
    },
    allowEstimatorsCreateProjects: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "suspended", "cancelled"],
        default: "active",
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      currentPeriodEnd: Date,
      trialEndsAt: Date,
    },
    suspendedAt: Date,
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    suspensionReason: String,
  },
  {
    timestamps: true,
  }
);

// Generate a unique join code before saving
CompanySchema.pre("save", async function (next) {
  // Only generate joinCode if it doesn't exist or is null
  if (!this.joinCode) {
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      // Generate a 6-character alphanumeric code
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      // Check if this code already exists
      const existingCompany = await mongoose.models.Company.findOne({
        joinCode: result,
      });
      if (!existingCompany) {
        this.joinCode = result;
        isUnique = true;
      }

      attempts++;
    }

    if (!isUnique) {
      return next(new Error("Could not generate unique join code"));
    }
  }

  next();
});

// Remove duplicate index definitions - keep only one
// Remove either the index: true in the field definition OR the schema.index() calls below
CompanySchema.index({ name: 1 });
// CompanySchema.index({ joinCode: 1 }); // Remove this line if you have it
CompanySchema.index({ ownerId: 1 });
CompanySchema.index({ "subscription.status": 1 });

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", CompanySchema);
