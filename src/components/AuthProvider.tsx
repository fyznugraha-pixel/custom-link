"use client";

import { SessionProvider } from "next-auth/react";
import UserActivityTracker from "./UserActivityTracker";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <UserActivityTracker />
      {children}
    </SessionProvider>
  );
}
