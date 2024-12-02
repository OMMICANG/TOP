import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient"; // Ensure this points to your client setup




export async function POST(req: NextRequest) {
  // if (req.method !== "POST") {
  //   return NextResponse.status(405).json({ error: "Method not allowed" });
  // }


    const { uuid, country } = await req.json();

  if (!uuid || !country) {
    return NextResponse.json(
      { error: 'UUID and Country are required' },
      { status: 400 }
    );
  }

  try {

    // const countryTable = `approved_users_${country.replace(/\s+/g, '')}`;

    // Call the RPC function to increment the streak count
    const { error } = await supabase.rpc("increment_streak", {
      uuid_input: uuid,
      country_input: country,
    });


    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update streak in database' },
        { status: 500 }
      );
    }
;

    // return NextResponse.status(200).json({ message: "Streak updated successfully", data });
    return NextResponse.json(
      { message: 'Streak updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    // return NextResponse.status(500).json({ error: "Failed to update streak" });
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
