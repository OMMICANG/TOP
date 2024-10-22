// "use server"; // Ensure this file runs on the server

// import { createClient } from "@supabase/supabase-js";
// import sgMail from '@sendgrid/mail'; // Import SendGrid

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const sendGridApiKey = process.env.SENDGRID_API_KEY!; // Your SendGrid API key

// const supabase = createClient(supabaseUrl, supabaseKey);

// // Initialize SendGrid
// sgMail.setApiKey(sendGridApiKey);

// // Server Action function to send confirmation email
// export async function sendEmail(kycUUID: string) {
//   try {
//     // Step 1: Query Supabase to get the user's email and other details using kycUUID
//     const { data: userData, error: queryError } = await supabase
//       .from('kyc_users') // Assuming 'kyc_users' is the table name
//       .select('email, name, country, identity_type')
//       .eq('uuid', kycUUID)
//       .single();

//     if (queryError || !userData) {
//       console.error("Failed to retrieve user data from Supabase", queryError);
//       throw new Error("Failed to retrieve user data.");
//     }

//     const { email, name, country, identity_type } = userData;

//     // Step 2: Compose and send the email using SendGrid
//     const msg = {
//       to: email,
//       from: 'no-reply@theommicangproject.com', // Your verified sender email
//       subject: 'KYC Confirmation - OMMICANG',
//       text: `Hi ${name},\n\nThank you for completing the KYC process!\n\nYour details:\n- Name: ${name}\n- Country: ${country}\n- ID Type: ${identity_type}\n\nBest Regards,\nOMMICANG Team`,
//       html: `<strong>Hi ${name},</strong><br><br>Thank you for completing the KYC process!<br><br>Your details:<br>- Name: ${name}<br>- Country: ${country}<br>- ID Type: ${identity_type}<br><br>Best Regards,<br>OMMICANG Team`,
//     };

//     await sgMail.send(msg); // Send email using SendGrid

//     return { message: "Email sent successfully" };

//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error in sendEmail", error.message);
//       throw new Error("Internal Server Error");
//     } else {
//       console.error("Unknown error occurred");
//       throw new Error("An unknown error occurred");
//     }
//   }
// }




// *****************************************************************************

// // "use server"; // Ensure this file runs on the server

// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Server Action function to send confirmation email
// export async function sendEmail(kycUUID: string) {
//   try {
//     // Invoke the Supabase edge function to send the email
//     const { data, error } = await supabase.functions.invoke("success_email", {
//       body: { kycUUID },
//     });

//     if (error) {
//       console.error("Failed to send email", error);
//       throw new Error("Failed to send confirmation email.");
//     }

//     return { message: "Email sent successfully", data };
//   }catch (error: unknown) {
//     if (error instanceof Error) {
//       console.error("Error in sendEmail", error.message);
//       throw new Error("Internal Server Error");
//     } else {
//       console.error("Unknown error occurred");
//       throw new Error("An unknown error occurred");
//     }

//   }
// }
