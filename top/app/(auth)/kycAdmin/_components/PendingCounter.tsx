"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient.ts";

export default function PendingCounter() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

   // Fetch initial count
  useEffect(() => {
    const fetchPendingCount = async () => {
      const { count, error } = await supabase
        .from("kyc_users")
        .select("*", { count: "exact" });

      if (error) {
        console.error("Error fetching pending count:", error);
      } else {
        setPendingCount(count);
      }
    };

    fetchPendingCount();

    // Subscribe to real-time changes | This Enables real-time update of counter
    const subscription = supabase
      .channel('pending_counter')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kyc_users' },
        () => {
          setPendingCount((prevCount) => prevCount + 1); // Increment count on new row
          
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'kyc_users' },
        () => {
          setPendingCount((prevCount) => prevCount - 1); // Increment count on new row
          
        }
      )
      
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <span className="pending-counter">
      Pending: {pendingCount}
    </span>
  );
}
