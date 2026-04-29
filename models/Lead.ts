import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILead extends Document {
  name: string;
  email?: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: "New" | "Contacted" | "Negotiating" | "Closed" | "Lost";
  notes?: string;
  assignedTo?: mongoose.Types.ObjectId;
  score: "High" | "Medium" | "Low";
  nextFollowUp?: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    propertyInterest: { type: String, required: true },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ["New", "Contacted", "Negotiating", "Closed", "Lost"],
      default: "New",
    },
    notes: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    score: {
      type: String,
      enum: ["High", "Medium", "Low"],
    },
    nextFollowUp: { type: Date },
  },
  { timestamps: true }
);

// Pre-save hook for Lead Scoring System
LeadSchema.pre("save", function (this: any) {
  if (this.isModified("budget") || this.isNew) {
    const budget = this.budget;
    if (budget > 20000000) {
      this.score = "High";
    } else if (budget >= 10000000 && budget <= 20000000) {
      this.score = "Medium";
    } else {
      this.score = "Low";
    }
  }
});

export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
