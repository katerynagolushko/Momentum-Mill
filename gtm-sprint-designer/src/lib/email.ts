import { Resend } from "resend";

// With RESEND_API_KEY set, magic links go out by email; without it (local dev)
// the link is printed to the server console instead.
export async function sendMagicLink(email: string, url: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`\n[dev] Magic link for ${email}:\n${url}\n`);
    return;
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "GTM Sprint <onboarding@resend.dev>",
    to: email,
    subject: "Your GTM Sprint sign-in link",
    text: `Sign in to GTM Sprint Designer:\n\n${url}\n\nThis link expires in 15 minutes. If you didn't request it, ignore this email.`,
  });
  if (error) throw new Error(`Failed to send magic link: ${error.message}`);
}
