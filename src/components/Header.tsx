"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const fullName = user?.user_metadata?.full_name as string | undefined;
  const firstName = fullName?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "";

  return (
    <header className="header-gradient-border flex items-center justify-between bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <BookOpen className="size-6 text-primary" />
        <span className="text-lg font-bold text-foreground">
          えいご絵本リーダー
        </span>
      </Link>

      {!isLoading && (
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={firstName}
                    width={28}
                    height={28}
                    className="rounded-full ring-2 ring-primary/30"
                  />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-bold text-foreground">
                  {firstName}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="ログアウト"
                title="ログアウト"
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
            >
              <LogIn className="size-3.5" />
              ログイン
            </button>
          )}
        </div>
      )}
    </header>
  );
}
