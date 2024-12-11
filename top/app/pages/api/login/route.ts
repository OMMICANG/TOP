import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "../../../lib/supabaseClient"; // Ensure this points to your client setup

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const countryTables = ["approved_users_Nigeria", "approved_users_UnitedKingdom"];
    let userFound = null;

    for (const table of countryTables) {
      const { data, error } = await supabase
        .from(table)
        .select("uuid, name, country, email, password, isBetaUser, isMerchant")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(`Error querying ${table}:`, error);
        continue;
      }

      if (data) {
        userFound = data;
        break;
      }
    }

    if (!userFound) {
      return NextResponse.json({ error: "You Are Not OMMICANG" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, userFound.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect password. Please Try Again" }, { status: 401 });
    }

    return NextResponse.json({
      uuid: userFound.uuid,
      name: userFound.name,
      country: userFound.country,
      email: userFound.email,
      isBetaUser: userFound.isBetaUser,
      isMerchant: userFound.isMerchant,
    });
  } catch (error) {
    console.error("Error in login handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
