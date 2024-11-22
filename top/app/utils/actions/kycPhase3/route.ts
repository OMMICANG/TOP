"use server";

import { supabase } from "../../../lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const kycUUID = formData.get("kycUUID") as string;
    const videoBlob = formData.get("video") as File;

    if (!kycUUID || !videoBlob) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const uploadPath = `videos/${Date.now()}_${kycUUID}_video.webm`;
    const { data, error: uploadError } = await supabase.storage
      .from("kyc_videos")
      .upload(uploadPath, videoBlob);

    if (uploadError) {
      return NextResponse.json({ error: "Failed to upload video. Please try again." }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("kyc_videos")
      .getPublicUrl(data.path);

    if (!publicUrlData?.publicUrl) {
      throw new Error("Failed to retrieve public URL");
      return NextResponse.json({ error: "Failed to retrieve the public URL of the video." }, { status: 500 });
    }

    const publicURL = publicUrlData.publicUrl;

    const { error: dbError } = await supabase.from("kyc_videos").insert([
      {
        uuid: kycUUID,
        video_url: publicURL,
      },
    ]);

    if (dbError) {
      return NextResponse.json({ error: "Failed to save video URL to database. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}




// import { supabase } from "../../../lib/supabaseClient";

// export const kycPhase3 = async (kycUUID: string, videoBlob: Blob) => {
//   try {
//     const { data, error: uploadError } = await supabase.storage
//       .from("kyc_videos")
//       .upload(`videos/${Date.now()}_${kycUUID}_video.webm`, videoBlob);

//     if (uploadError) {
//       return { error: "Failed to upload video. Please try again." };
//     }

//     const publicURL = supabase.storage
//       .from("kyc_videos")
//       .getPublicUrl(data?.path)
//       .data.publicUrl;

//     if (!publicURL) {
//       return { error: "Failed to retrieve the public URL of the video." };
//     }

//     const { error: dbError } = await supabase.from("kyc_videos").insert([
//       {
//         uuid: kycUUID,
//         video_url: publicURL,
//       },
//     ]);

//     if (dbError) {
//       return { error: "Failed to submit the video. Please try again." };
//     }

//     return { success: true };
//   } catch (error) {
//     return { error: "An unexpected error occurred." };
//     console.log(error);
//   }
// };
