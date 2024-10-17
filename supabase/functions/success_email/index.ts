// supabase/functions/success_email/index.ts

import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'; // Use the new import link
import sgMail from 'https://esm.sh/@sendgrid/mail@7.2.1';

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize SendGrid with API key
sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY') ?? '');

serve(async (req) => {
  try {
    // Parse request body
    const { kycUUID } = await req.json();

    // Fetch the user's email and name from Supabase using the UUID
    const { data, error } = await supabase
      .from('kyc_users')
      .select('email, full_name')
      .eq('uuid', kycUUID)
      .single();

    if (error) {
      throw new Error('Failed to fetch user data.');
    }

    const { email, full_name } = data;

    // Compose the email
    const msg = {
      to: email, // Recipient's email address
      from: 'no-reply@theommicangproject.online', // Your verified sender
      subject: 'KYC Process Completed',
      text: `Hi ${full_name}, your KYC process has been successfully completed. Welcome to OMMICANG!`,
      html: `<strong>Hi ${full_name}</strong>,<br><br>Your KYC process has been successfully completed. Welcome to OMMICANG!`,
    };

    // Send the email via SendGrid
    await sgMail.send(msg);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email.' }),
      { status: 500 }
    );
  }
});
