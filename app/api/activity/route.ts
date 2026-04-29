import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { User } from "@/models/User";
import { Lead } from "@/models/Lead";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch the 50 most recent logs. 
    // We use .populate() to join the User and Lead tables to get their actual names.
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 }) // Newest first
      .limit(50)
      .populate({ path: "userId", select: "name role", model: User })
      .populate({ path: "leadId", select: "name propertyInterest", model: Lead });

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("GET /api/activity error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}