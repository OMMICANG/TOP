import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

console.log(`Function "email" up and running!`);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');



serve(async (req: Request) => {
    try {
      const { email, name, country } = await req.json(); // Adjust as per your KYC data
      
      if (!email || !name || !country) {
        return new Response(JSON.stringify({ error: "Missing data" }), { status: 400 });
      }
  
      const headers = {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      };

      const headers = {
        URL: 'https://pkmyqbttmqoipqyuqtmg.supabase.co',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      };
  
      const emailData = {
        from: "no-reply@theommicangproject.online",  // Use a verified email
        to: email,
        subject: "KYC Confirmation",
        text: `Dear ${name}, your KYC verification for ${country} has been successfully submitted. Thank you!`,
      };
  
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers,
        body: JSON.stringify(emailData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to send email");
      }
  
      return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      );
    }
  });

// ************************************************************************************
// const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
// const SENDGRID_ENDPOINT = Deno.env.get("SENDGRID_ENDPOINT");
// const SENDGRID_SENDER_EMAIL = Deno.env.get("SENDGRID_SENDER_EMAIL");
// const SENDGRID_SENDER_NAME = Deno.env.get("SENDGRID_SENDER_NAME");

// import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// serve(async (req: Request) => {
//   try {
//     // Assuming the request contains the kycUUID
//     const { kycUUID } = await req.json();

//     // Here you'd retrieve the user's email and details from the Supabase database
//     const { data, error } = await supabase
//       .from('kyc_users')
//       .select('email, name, country, identity_type')
//       .eq('kycUUID', kycUUID)
//       .single();

//     if (error || !data) {
//       throw new Error("Failed to retrieve user details");
//     }

//     const emailData = {
//       personalizations: [
//         {
//           to: [{ email: data.email }],
//           subject: "KYC Submission Confirmation",
//         },
//       ],
//       content: [
//         {
//           type: "text/plain",
//           value: `Dear ${data.name},\n\nThank you for submitting your KYC details. We have received your information and will process it shortly.\n\nBest regards,\nOMMICANG Team`,
//         },
//       ],
//       from: {
//         email: SENDGRID_SENDER_EMAIL,
//         name: SENDGRID_SENDER_NAME,
//       },
//     };

//     const headers = {
//       Authorization: `Bearer ${SENDGRID_API_KEY}`,
//       "Content-Type": "application/json",
//     };

//     // Make the SendGrid API call
//     const response = await fetch(SENDGRID_ENDPOINT, {
//       method: "POST",
//       headers,
//       body: JSON.stringify(emailData),
      
//     });

//     if (!response.ok) {
//       throw new Error("Failed to send email");
//     }

//     return new Response(JSON.stringify({ message: "Success", error: null }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });

//   } catch (error) {
//     return new Response(
//       JSON.stringify({ message: "Error", error: error.message }),
//       {
//         headers: { "Content-Type": "application/json" },
//         status: 400,
//       },
//     );
//   }
// });



// ********************************************************************

// import { serve } from 'https://deno.land/x/sift@0.5.0/mod.ts';
// import { createClient } from '@supabase/supabase-js';
// import sgMail from '@sendgrid/mail';

// sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY'));

// serve(async (req) => {
//   const { kycUUID } = await req.json();

//   // Supabase client initialization
//   const supabaseUrl = Deno.env.get('SUPABASE_URL');
//   const supabaseKey = Deno.env.get('SUPABASE_KEY');
//   const supabase = createClient(supabaseUrl, supabaseKey);

//   // Fetch user KYC details by UUID
//   const { data, error } = await supabase
//     .from('kyc_users')
//     .select('email, name, country, identity_type')
//     .eq('uuid', kycUUID);

//   if (error || !data || data.length === 0) {
//     return new Response('Failed to fetch KYC details', { status: 500 });
//   }

//   const user = data[0];

//   // Compose the confirmation email
//   const msg = {
//     to: user.email,
//     from: 'no-reply@theommicangproject.com',
//     subject: 'KYC Confirmation',
//     text: `Hi ${user.name},\nYour KYC has been successfully submitted. Thank you!`,
//   };

//   try {
//     await sgMail.send(msg);
//     return new Response('Email sent successfully', { status: 200 });
//   } catch (error) {
//     console.log(error);
//     return new Response('Failed to send email', { status: 500 });
//   }
// });
