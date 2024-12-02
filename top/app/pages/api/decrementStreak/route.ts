import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient"; // Ensure the correct import path

export async function POST(req: NextRequest) {
  const { uuid, country } = await req.json();

  if (!uuid || !country) {
    return NextResponse.json({ error: "Missing uuid or country" }, { status: 400 });
  }

  const countryTable = `approved_users_${country.replace(/\s+/g, "")}`;

  try {
    // Fetch user's last_streak and streak_count
    const { data, error } = await supabase
      .from(countryTable)
      .select("last_streak, streak_count")
      .eq("uuid", uuid)
      .single();

    if (error || !data) {
      throw new Error("User data not found");
    }

    const { last_streak, streak_count } = data;
    if (!last_streak || streak_count === undefined) {
      return NextResponse.json({ error: "Incomplete user data" }, { status: 400 });
    }

    // Calculate the time difference in days
    const currentTime = new Date();
    const lastStreakDate = new Date(last_streak);
    const timeDifference = currentTime.getTime() - lastStreakDate.getTime();
    const daysMissed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if (daysMissed > 0) {
      const newStreakCount = Math.max(0, streak_count - daysMissed);

      // Update the streak_count and last_streak in the database
      const { error: updateError } = await supabase
        .from(countryTable)
        .update({ 
          streak_count: newStreakCount,
          // last_streak: currentTime.toISOString()
        })
        .eq("uuid", uuid);

      if (updateError) {
        throw new Error("Failed to update streak data");
      }

      return NextResponse.json({ message: "Streak updated", streakCount: newStreakCount });
    }

    // No update needed if no days were missed
    return NextResponse.json({ message: "No streak decrement needed", streakCount: streak_count });
  } catch (error) {
    console.error("Error decrementing streak:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
