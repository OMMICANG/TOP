import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase project URL and service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  try {
    // Parse the incoming request body
    const { kycUUID } = await req.json();

    // Fetch the user's email using the UUID from the KYC table
    const { data, error } = await supabase
      .from("kyc_users")
      .select("email")
      .eq("uuid", kycUUID)
      .single();

    if (error || !data) {
      return new Response("Failed to retrieve user email", { status: 400 });
    }

    const email = data.email;

    // Send the success email (hypothetical sendEmail function)
    // await sendSuccessEmail(email);

    return new Response("Success email sent", {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://top-orcin.vercel.app/",  // Allow all origins for testing, you can specify your frontend URL instead
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    return new Response(`Error: ${err.message}`, {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",  // CORS header
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
});



// // supabase/functions/success_email/index.ts

// import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
// import { createClient } from 'jsr:@supabase/supabase-js@2'; // Use the new import link
// import sgMail from 'https://esm.sh/@sendgrid/mail@7.2.1';

// // Initialize Supabase client
// const supabase = createClient(
//   Deno.env.get('SUPABASE_URL') ?? '',
//   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
// );

// // Initialize SendGrid with API key
// sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY') ?? '');

// serve(async (req) => {
//   try {
//     // Parse request body
//     const { kycUUID } = await req.json();

//     // Fetch the user's email and name from Supabase using the UUID
//     const { data, error } = await supabase
//       .from('kyc_users')
//       .select('email, full_name')
//       .eq('uuid', kycUUID)
//       .single();

//     if (error) {
//       throw new Error('Failed to fetch user data.');
//     }

//     const { email, full_name } = data;

//     // Compose the email
//     const msg = {
//       to: email, // Recipient's email address
//       from: 'no-reply@theommicangproject.online', // Your verified sender
//       subject: 'KYC Process Completed',
//       text: `Hi ${full_name}, your KYC process has been successfully completed. Welcome to OMMICANG!`,
//       html: `<strong>Hi ${full_name}</strong>,<br><br>Your KYC process has been successfully completed. Welcome to OMMICANG!`,
//     };

//     // Send the email via SendGrid
//     await sgMail.send(msg);

//     return new Response("Success email sent", {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "https://top-orcin.vercel.app/",  // Allow all origins for testing, you can specify your frontend URL instead
//         "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//       },
//     });
//   } catch (err) {
//     return new Response(`Error: ${err.message}`, {
//       status: 500,
//       headers: {
//         "Access-Control-Allow-Origin": "*",  // CORS header
//         "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//       },
//     });
//   }

//     return new Response(
//       JSON.stringify({ message: 'Email sent successfully.' }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return new Response(
//       JSON.stringify({ error: 'Failed to send email.' }),
//       { status: 500 }
//     );
//   }
// });
