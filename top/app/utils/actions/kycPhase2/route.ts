"use server";

import { supabase } from "../../../lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
// import { nanoid } from "nanoid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const kycUUID = formData.get("kycUUID") as string;
    const faceImage = formData.get("faceImage") as File;

    // Validate required fields
    if (!kycUUID || !faceImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upload file to Supabase storage
    const uploadPath = `faces/${Date.now()}_${kycUUID}.png`;
    const { data, error: uploadError } = await supabase.storage
      .from("kyc_face_images")
      .upload(uploadPath, faceImage);

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload face image. Try again." }, { status: 500 });
    }

    // Retrieve public URL
    const { data: publicUrlData } = supabase.storage
      .from("kyc_face_images")
      .getPublicUrl(data.path);

    if (!publicUrlData) {
      throw new Error("Failed to retrieve public URL");
      return NextResponse.json({ error: "Failed to retrieve public URL for face image." }, { status: 500 });
    }

    const faceImageURL = publicUrlData.publicUrl;

    // Insert data into the database
    const { error: insertError } = await supabase.from("kyc_face_images").insert([
      {
        uuid: kycUUID,
        face_image_url: faceImageURL,
      },
    ]);

    if (insertError) {
      return NextResponse.json({ error: "Failed to save face image to database. Try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
