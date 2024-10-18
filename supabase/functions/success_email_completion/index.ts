import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'; // Use the new import link
import { sendEmail } from './utils/sendEmail.js'; // Import your sendEmail utility

// Initialize Supabase Client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    const { email, name } = await req.json(); // Fetch user details from the request body

    // Send email via SendGrid
    const subject = 'KYC Completion Notification';
    const content = `Dear ${name},\n\nYour KYC process has been successfully completed!`;

    const emailResponse = await sendEmail(email, subject, content); // Use sendEmail utility to send email

    if (emailResponse.status !== 202) {
      throw new Error('Email sending failed');
    }

    // Return success response
    return new Response(JSON.stringify({ message: 'KYC completion email sent successfully!' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log and return the error response
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send KYC completion email' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});



// *****************************************************************************************************

// import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
// import { createClient } from 'jsr:@supabase/supabase-js@2'; // Use the new import link
// import { sendEmail } from "./utils/sendEmail.ts";

// const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
// const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// const supabase = createClient(supabaseUrl, supabaseKey);

// serve(async (req) => {
//   if (req.method === 'OPTIONS') {
//     // Handle preflight request for CORS
//     return new Response(null, {
//       status: 204,
//       headers: {
//         "Access-Control-Allow-Origin": "https://top-orcin.vercel.app",
//         "Access-Control-Allow-Methods": "POST, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization",
//         "Access-Control-Max-Age": "86400",
//       },
//     });
//   }

//   try {
//     const { kycUUID } = await req.json();

//     // Fetch user data based on the UUID
//     const { data: userData, error } = await supabase
//       .from("kyc_users")
//       .select("name, email, country, identity_type, identity_card_number")
//       .eq("uuid", kycUUID)
//       .single();

//     if (error) {
//       return new Response("Error fetching user data", { status: 400 });
//     }

//     // Prepare the email content
//     const emailContent = `
//       Hi ${userData.name},
//       Your KYC process has been successfully completed. Below are your details:
//       - Name: ${userData.name}
//       - Email: ${userData.email}
//       - Country: ${userData.country}
//       - Identity Type: ${userData.identity_type}
//       - Identity Card Number: ${userData.identity_card_number}
//     `;

//     // Send the email
//     const emailResponse = await sendEmail(userData.email, "KYC Completion", emailContent);
//     if (!emailResponse.ok) {
//       return new Response("Failed to send email", { status: 500 });
//     }

//     return new Response("Email sent successfully", {
//       status: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "https://top-orcin.vercel.app",
//       },
//     });
//   } catch (error) {
//     return new Response("Failed to send email", {
//       status: 500,
//       headers: {
//         "Access-Control-Allow-Origin": "https://top-orcin.vercel.app",
//       },
//     });
//   }
// });





// *****************************************************************************************************************

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/success_completion_email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
