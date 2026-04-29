import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { Lead } from "@/models/Lead";
import { ActivityLog } from "@/models/ActivityLog";
import { User } from "@/models/User";
import { sendAssignmentConfirmation } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Role check: Only assigned agents or Admins can update
    if (session.user.role !== "Admin" && lead.assignedTo?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let actionStr = "updated details for";
    
    // Check if assignment changed
    if (body.assignedTo && body.assignedTo !== lead.assignedTo?.toString()) {
      const newAgent = await User.findById(body.assignedTo);
      actionStr = `reassigned lead to ${newAgent?.name || "Agent"}`;
      if (newAgent && newAgent.email) {
        sendAssignmentConfirmation(newAgent.email, lead.name).catch(console.error);
      }
    } else if (body.status && body.status !== lead.status) {
      actionStr = `updated lead status to ${body.status} for`;
    }

    // Update the lead
    const updatedLead = await Lead.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    // Log activity
    await ActivityLog.create({
      action: actionStr,
      leadId: lead._id,
      userId: session.user.id,
    });

    return NextResponse.json(updatedLead);
  } catch (error: any) {
    console.error("PATCH /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const lead = await Lead.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (session.user.role !== "Admin" && lead.assignedTo?.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Lead.findByIdAndDelete(id);

    await ActivityLog.create({
      action: "deleted a lead",
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
