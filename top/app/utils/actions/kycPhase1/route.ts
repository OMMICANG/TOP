"use server";

import {supabase} from "../../../lib/supabaseClient"
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const country = formData.get("country") as string;
    const identityType = formData.get("identityType") as string;
    const identityCardNumber = formData.get("identityCardNumber") as string;
    const identityCard = formData.get("identityCard") as File;

    // Generate a unique KYC UUID
    const kycUUID = nanoid();


    // Validate required fields
    if (!name || !email || !country || !identityType || !identityCardNumber || !identityCard) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload file to Supabase storage
    const uploadPath = `identity-cards/${Date.now()}_${identityCard.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from("kyc_identity_cards")
      .upload(uploadPath, identityCard);

    if (uploadError) {
      return NextResponse.json({ error: "Failed To Upload Identity Card. Try Again" }, { status: 500 });
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
    .from("kyc_identity_cards")
    .getPublicUrl(data.path);
  
  if (!publicUrlData) {
    throw new Error("Failed to retrieve public URL");
    return NextResponse.json({ success: false, error: "Failed to generate public URL for identity card" });
  }
  
  const identityCardURL = publicUrlData.publicUrl;
  

    // Insert user data into the database
    const { error: insertError } = await supabase.from("kyc_users").insert([
      {
        uuid: kycUUID, //storing the UUID
        name: name,
        email: email,
        country: country,
        identity_type: identityType,
        identity_card_number: identityCardNumber,
        identity_card_url: identityCardURL,
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: "Failed To Submit. Try Again" }, { status: 500 });
    }

    return NextResponse.json({ success: true, kycUUID });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
