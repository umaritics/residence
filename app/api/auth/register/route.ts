import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import { UserRegistrationSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate using Zod
    const result = UserRegistrationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create user (hardcoded to Agent by default)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Agent", // Always default to Agent for security
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
