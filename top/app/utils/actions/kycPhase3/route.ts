import { supabase } from "../../../lib/supabaseClient";

export const kycPhase3 = async (kycUUID: string, videoBlob: Blob) => {
  try {
    const { data, error: uploadError } = await supabase.storage
      .from("kyc_videos")
      .upload(`videos/${Date.now()}_${kycUUID}_video.webm`, videoBlob);

    if (uploadError) {
      return { error: "Failed to upload video. Please try again." };
    }

    const publicURL = supabase.storage
      .from("kyc_videos")
      .getPublicUrl(data?.path)
      .data.publicUrl;

    if (!publicURL) {
      return { error: "Failed to retrieve the public URL of the video." };
    }

    const { error: dbError } = await supabase.from("kyc_videos").insert([
      {
        uuid: kycUUID,
        video_url: publicURL,
      },
    ]);

    if (dbError) {
      return { error: "Failed to submit the video. Please try again." };
    }

    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred." };
    console.log(error);
  }
};
