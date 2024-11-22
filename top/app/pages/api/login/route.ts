import type { NextRequest, NextResponse } from "next/server";
import { NextResponse } from "next/server";
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
        .select("uuid, name, country, email, password")
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
    });
  } catch (error) {
    console.error("Error in login handler:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}













// ******************************************************************************************************************************************
// "use server"

// import type { NextApiRequest, NextApiResponse } from "next";
// import bcrypt from "bcryptjs";
// import { supabase } from "../../../lib/supabaseClient"; // Secure Supabase client with Anon Key

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // if (req.method !== "POST") {
//   //   return res.status(405).json({ error: "Method not allowed" });
//   // }

//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }

//   try {
//     const countryTables = ["approved_users_Nigeria", "approved_users_UnitedKingdom"];
//     let userFound = null;

//     // Iterate through country tables to find the user
//     for (const table of countryTables) {
//       const { data, error } = await supabase
//         .from(table)
//         .select("uuid, name, country, email, password")
//         .eq("email", email)
//         .single();

//       if (error && error.code !== "PGRST116") {
//         console.error(`Error querying ${table}:`, error);
//         continue;
//       }

//       if (data) {
//         userFound = data;
//         break;
//       }
//     }

//     if (!userFound) {
//       return res.status(404).json({ error: "You Are Not OMMICANG" });
//     }

//     // Verify password
//     const passwordMatch = await bcrypt.compare(password, userFound.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ error: "Incorrect password. Please Try Again" });
//     }

//     // Return successful login response
//     res.status(200).json({
//       uuid: userFound.uuid,
//       name: userFound.name,
//       country: userFound.country,
//       email: userFound.email,
//     });
//   } catch (error) {
//     console.error("Error in login handler:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
