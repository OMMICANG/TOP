"use server";

import type { NextApiRequest, NextApiResponse } from "next";
// Supabase client setup
import { createClient } from "@supabase/supabase-js";

// Supabase project URL and service role key from environment variables
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { kycUUID } = req.body;

      // Call the Supabase function using the supabase client
      const { data, error } = await supabase.functions.invoke("success_email", {
        body: { kycUUID },
      });

      if (error) {
        return res.status(500).json({ message: "Failed to invoke Supabase function", error });
      }

      return res.status(200).json({ message: "Success email sent", data });
    } catch (err) {
      // Type guard to check if 'err' is an instance of Error and has a 'message'
      if (err instanceof Error) {
        return res.status(500).json({ message: "Internal server error", error: err.message });
      }
      // If the error is not of type 'Error', handle it in a generic way
      return res.status(500).json({ message: "Internal server error", error: String(err) });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.setHeader("Access-Control-Allow-Origin", "https://top-orcin.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
