"use server"; // Ensure this file runs on the server

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Server Action function to send confirmation email
export async function sendEmail(kycUUID: string) {
  try {
    // Invoke the Supabase edge function to send the email
    const { data, error } = await supabase.functions.invoke("success_email", {
      body: { kycUUID },
    });

    if (error) {
      console.error("Failed to send email", error);
      throw new Error("Failed to send confirmation email.");
    }

    return { message: "Email sent successfully", data };
  }catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in sendEmail", error.message);
      throw new Error("Internal Server Error");
    } else {
      console.error("Unknown error occurred");
      throw new Error("An unknown error occurred");
    }

  }
}
