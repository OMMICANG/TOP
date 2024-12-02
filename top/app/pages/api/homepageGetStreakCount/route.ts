import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient"; // Ensure this points to your client setup


export async function POST(req: NextRequest) {
//   if (req.method !== "POST") {
//     return NextResponse.json({ error: "Method not allowed" });
//   }

  const { uuid, country } = await req.json();

  if (!uuid || !country) {
    return NextResponse.json({ error: "Missing uuid or country" });
  }

  const countryTable = `approved_users_${country.replace(/\s+/g, "")}`;

  try {
    const { data, error } = await supabase
      .from(countryTable)
      .select("streak_count, last_streak")
      .eq("uuid", uuid)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" });
    }

    return NextResponse.json({ 
      streakCount: data.streak_count,
      lastStreak: data.last_streak,
    });
  } catch (error) {
    console.error("Error fetching streak count:", error.message);
    return NextResponse.json({ error: "Internal server error" });
  }
};
