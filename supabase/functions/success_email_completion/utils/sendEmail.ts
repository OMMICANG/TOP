import { MailService} from "https://deno.land/x/sendgrid/mod.ts"; // Updated the import

export async function sendEmail(to: string, subject: string, content: string) {
  const apiKey = Deno.env.get("SENDGRID_API_KEY")!;
  const client = new MailService();
  client.setApiKey(apiKey);

  const msg = {
    personalizations: [
      {
        to: [{ email: to }],
        subject: subject,
      },
    ],
    from: { email: "no-reply@theommicangproject.online" }, // Replace with your verified SendGrid email
    content: [{ type: "text/plain", value: content }],
  };

  try {
    const response = await client.send(msg);
    return response;
  } catch (error) {
    console.error("Error sending email: ", error);
    return { ok: false };
  }
}
