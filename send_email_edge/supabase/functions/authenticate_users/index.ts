// import { serve } from "https://deno.land/std@0.224.0/http/server.ts";


// No Longer Required, had Production Flaws with only copying the table of trigger that calls it and not any other that calls it after
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const supabaseAdmin = createClient(
//   Deno.env.get("SUPABASE_URL") ?? "",
//   Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
// );

// const countryTables = ["approved_users_Nigeria", "approved_users_UnitedKingdom", "approved_users_Canada"];

// serve(async () => {
//   try {
//     for (const table of countryTables) {
//       // Fetch only the top row from each table
//       const { data: users, error } = await supabaseAdmin.from(table).select("*").limit(1);
//       if (error) {
//         console.error(`Error fetching users from ${table}:`, error);
//         continue;
//       }

//       for (const user of users) {
//         const { data: existingUser, error: fetchError } = await supabaseAdmin
//           .from("authenticated_users")
//           .select("uuid")
//           .eq("uuid", user.uuid)
//           .single();

//         if (fetchError && fetchError.code !== "PGRST116") {
//           console.error(`Error checking duplicate for ${user.uuid}:`, fetchError);
//           continue;
//         }

//         if (!existingUser) {
//           const { error: insertError } = await supabaseAdmin.from("authenticated_users").insert({
//             uuid: user.uuid,
//             name: user.name,
//             email: user.email,
//             country: user.country,
//             role: "authenticated",
//           });

//           if (insertError) {
//             console.error("Error inserting authenticated user:", insertError);
//           } else {
//             console.log(`User ${user.uuid} added to authenticated_users.`);
//           }
//         } else {
//           console.log(`User ${user.uuid} already exists in authenticated_users. Skipping.`);
//         }
//       }
//     }

//     return new Response("Authenticated users processed successfully", { status: 200 });
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return new Response("Internal server error", { status: 500 });
//   }
// });
