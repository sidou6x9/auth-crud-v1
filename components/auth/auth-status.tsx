"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  return (
    <div className="flex items-center gap-4">
      {session ? (
        <>
          <Link href="/admin" className="text-sm text-muted-foreground">
            {session.user?.name || session.user?.email}
          </Link>
          <SignOutButton />
        </>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );
}