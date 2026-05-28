import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function sendOtpEmail(email: string, code: string): Promise<void> {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: "KinLog", email: process.env.BREVO_SENDER! },
    to: [{ email }],
    subject: "Login OTP",
    textContent:
      `Your KinLog sign-in code is ${code}. It expires in 10 minutes. ` +
      `If you didn't request this, you can ignore this email.`,
    htmlContent: `<p>Your KinLog sign-in code is <b style="font-size:24px">${code}</b></p>
       <p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}
