import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;

  // UPDATED: Added "mitigation-tech" role
  role:
    | "super-admin"
    | "admin"
    | "project-manager"
    | "inspector"
    | "mitigation-tech"
    | "estimator";

  companyId: mongoose.Types.ObjectId;
  isActive: boolean;
  suspendedAt?: Date;
  suspendedBy?: mongoose.Types.ObjectId;
  suspensionReason?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // UPDATED ROLE ENUM: Added "mitigation-tech" role
    role: {
      type: String,
      required: true,
      enum: [
        "super-admin",
        "admin",
        "project-manager",
        "inspector",
        "mitigation-tech", // NEW ROLE ADDED
        "estimator",
      ],
      default: "admin", // First user becomes admin of their company
    },

    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ADD SUSPENSION FIELDS
    suspendedAt: Date,
    suspendedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    suspensionReason: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ companyId: 1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
