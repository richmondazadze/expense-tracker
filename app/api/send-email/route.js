import { NextResponse } from "next/server";
import Mailjet from "node-mailjet";

const mailjetClient = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

export async function POST(request) {
  try {
    const { email, displayName, isNewUser } = await request.json();

    if (!isNewUser) {
      console.log("User is not new, skipping welcome email");
      return NextResponse.json({ message: "Welcome email not required" });
    }

    console.log(`Sending welcome email to: ${email}`);

    const firstName = displayName.split(" ")[0];

    const result = await mailjetClient
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.SENDER_EMAIL,
              Name: "PennyTrack",
            },
            To: [
              {
                Email: email,
                Name: displayName,
              },
            ],
            Subject: "Welcome to PennyTrack!",
            TextPart: `Hello ${firstName},\n\nThank you for joining PennyTrack! We're thrilled to have you with us and can't wait for you to start managing your finances more efficiently.\n\nIf you have any questions or need assistance, feel free to reach out. We're here to help!\n\nBest regards,\nThe PennyTrack Team`,
            HTMLPart: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #4CAF50;">Welcome to PennyTrack, ${firstName}!</h2>
              <p>Thank you for joining PennyTrack! We're thrilled to have you with us and can't wait for you to start managing your finances more efficiently.</p>
              <p>If you have any questions or need assistance, feel free to reach out. We're here to help!</p>
              <p style="font-weight: bold;">Best regards,<br>The PennyTrack Team</p>
            </div>
          `,
          },
        ],
      });

    console.log("Email sent successfully:", result.body);
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}
