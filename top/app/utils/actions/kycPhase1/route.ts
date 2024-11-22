"use server";

// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
import{supabase} from "../../../lib/supabaseClient"
import type { NextRequest, NextResponse } from "next/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  // const supabase = createRouteHandlerClient({ cookies });

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const country = formData.get("country") as string;
    const identityType = formData.get("identityType") as string;
    const identityCardNumber = formData.get("identityCardNumber") as string;
    const identityCard = formData.get("identityCard") as File;

    // console.log(formData);

    // Generate a unique KYC UUID
    const kycUUID = nanoid();
    // console.log(kycUUID);


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
    const { data: publicUrlData, error: publicUrlError } = supabase.storage
    .from("kyc_identity_cards")
    .getPublicUrl(data.path);
  
  if (publicUrlError) {
    return NextResponse.json({ success: false, error: "Failed to generate public URL for identity card" });
  }
  
  const identityCardURL = publicUrlData.publicUrl;
  
      

    // const identityCardURL = " ";//publicURLData?.publicUrl;
    // console.log(identityCardURL);

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
