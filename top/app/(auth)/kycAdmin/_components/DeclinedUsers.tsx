"use server";
import { supabase } from "../../../lib/supabaseClient";

const declinedUser = async (uuid: string) => {
  try {

        // Fetch the user's data from `kyc_users`
        const { data, error } = await supabase
        .from("kyc_users")
        .select("uuid, name, email")
        .eq("uuid", uuid)
        .single();
  
      if (error) {
        console.error("Error fetching user data:", error);
        return { success: false, message: "Failed to fetch user data" };
      }

    // Check if the user already exists in `declined_users`
    const { data: existingUser, error: fetchError } = await supabase
      .from("declined_users")
      .select("uuid")
      .eq("uuid", uuid)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing user:", fetchError);
      return { success: false, message: "Error checking existing user" };
    }

    if (existingUser) {
      // alert("User already exists on table");
      return { success: false, message: "User already exists in the table" };
    }


    // Insert the data into `declined_users`
    const { error: insertError } = await supabase
      .from("declined_users")
      .insert({
        uuid: data.uuid,
        name: data.name,
        email: data.email
      });

    if (insertError) {
      console.error("Error inserting data into declined_users:", insertError);
      return { success: false, message: "Failed to decline user" };

    } else {
      // alert("Decline Email Sent Successfully");
      console.log("User declined successfully!");
      return { success: true, message: "Decline email sent successfully" };
    }
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return { success: false, message: "Unexpected server error" };
  }
};

export default declinedUser;
