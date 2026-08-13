"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function UserActivityTracker() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (session?.user) {
      // Ping the server to update lastActiveAt
      fetch("/api/user/ping", { method: "POST" }).catch(() => {});

      // Optionally set up an interval to ping every 5 minutes if they leave the tab open
      const interval = setInterval(() => {
        fetch("/api/user/ping", { method: "POST" }).catch(() => {});
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [session, pathname]); // Re-run when pathname changes (user navigates)

  return null;
}
