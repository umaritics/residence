import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = "MSM Technologies CRM <onboarding@resend.dev>"; // Update with verified domain if available

export const sendNewLeadAlert = async (agentEmail: string, leadName: string, budget: number) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [agentEmail],
      subject: `New Lead Alert: ${leadName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">MSM Technologies</h2>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 16px; margin-top: 0;">Hello,</p>
            <p style="font-size: 16px;">A new lead has been assigned to you.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${leadName}</p>
              <p style="margin: 0;"><strong>Budget:</strong> PKR ${budget.toLocaleString()}</p>
            </div>
            <p style="font-size: 14px; color: #64748b;">Please log in to the CRM to view contact details and follow up.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in CRM</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send new lead alert:", error);
  }
};

export const sendAssignmentConfirmation = async (agentEmail: string, leadName: string) => {
  try {
    await resend.emails.send({
      from: fromEmail,
      to: [agentEmail],
      subject: `Lead Reassigned: ${leadName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">MSM Technologies</h2>
          </div>
          <div style="padding: 24px;">
            <p style="font-size: 16px; margin-top: 0;">Hello,</p>
            <p style="font-size: 16px;">An existing lead has been reassigned to you by the Admin.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Lead Name:</strong> ${leadName}</p>
            </div>
            <p style="font-size: 14px; color: #64748b;">Please log in to the CRM to view the latest notes and status.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/login" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View in CRM</a>
            </div>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send assignment confirmation:", error);
  }
};
