"use server";
import { supabase } from "../../../lib/supabaseClient";
import bcrypt from "bcryptjs";

const approvedUser = async (uuid: string) => {
  try {
    // Retrieve the user's data from `kyc_users`
    const { data, error } = await supabase
      .from("kyc_users")
      .select("*")
      .eq("uuid", uuid)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return { success: false, message: "Failed to fetch user data" };
    }

    // Determine country-specific table based on `identity_type`
    const countryTable = `approved_users_${data.country.replace(/\s+/g, '')}`;
    
    // Check if the user already exists in the country-specific approved table
    const { data: existingUser, error: fetchError } = await supabase
      .from(countryTable)
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


    // Generate a secure hashed password for the user
    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(uuid, saltRounds);

    // Insert the data into the country-specific approved table
    const { error: insertError } = await supabase
      .from(countryTable)
      .insert({
        uuid: data.uuid,
        name: data.name,
        email: data.email,
        country: data.country,
        identity_type: data.identity_type,
        identity_card_number: data.identity_card_number,
        role: "authenticated",
        password: hashedPassword, // Include the hashed password
      });

    if (insertError) {
      console.error("Error inserting data into approved_users:", insertError);
       return { success: false, message: "Failed to approve user" };
    } else {
      // alert("Approval Email Sent Successfully");
      console.log("User Approved successfully!");
      return { success: true, message: "Approval email sent successfully" };
    }
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return { success: false, message: "Unexpected server error" };
  }
};

export default approvedUser;