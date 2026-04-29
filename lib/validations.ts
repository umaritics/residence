import { z } from "zod";

export const UserRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["Admin", "Agent"]).default("Agent"),
});

export const UserLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const LeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number is too short")
    // Very flexible regex for WhatsApp compatibility (+, spaces, hyphens, parentheses, digits)
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  propertyInterest: z.string().min(1, "Property interest is required"),
  budget: z.number().min(0, "Budget must be a positive number"),
  status: z
    .enum(["New", "Contacted", "Negotiating", "Closed", "Lost"])
    .default("New"),
  notes: z.string().optional(),
  assignedTo: z.string().optional(), // Expected to be an ObjectId string
  nextFollowUp: z.coerce.date().optional(),
});
