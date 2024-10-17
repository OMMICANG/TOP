import { send } from 'https://deno.land/x/sendgrid/mod.ts';

export async function sendEmail(to: string, subject: string, body: string) {
  const apiKey = Deno.env.get('SENDGRID_API_KEY');
  const response = await send({
    personalizations: [{ to: [{ email: to }] }],
    from: { email: 'noreply@yourdomain.com' },
    subject: subject,
    content: [{ type: 'text/plain', value: body }],
  }, apiKey);

  return response;
}
