import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { ActivityLog } from "@/models/ActivityLog";
import { LeadSchema } from "@/lib/validations";
import { sendNewLeadAlert } from "@/lib/notifications";
import { User } from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // If Agent, only fetch their assigned leads. If Admin, fetch all.
    const query = session.user.role === "Agent" ? { assignedTo: session.user.id } : {};

    const leads = await Lead.find(query).sort({ createdAt: -1 }).populate("assignedTo", "name email");

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error("GET /api/leads error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const result = LeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid lead data", details: result.error.format() },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create the lead
    const newLead = await Lead.create({
      ...result.data,
      assignedTo: session.user.id, // Assign to the creator automatically
    });

    // Write to ActivityLog
    await ActivityLog.create({
      action: "created a new lead:",
      leadId: newLead._id,
      userId: session.user.id,
    });

    if (session.user.email) {
      // Background email send
      sendNewLeadAlert(session.user.email, newLead.name, newLead.budget).catch(console.error);
    }

    return NextResponse.json(newLead, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/leads error:", error);
    require("fs").writeFileSync("debug.txt", String(error.stack || error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
