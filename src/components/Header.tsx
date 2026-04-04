"use client";

import Link from "next/link";
import { BookOpen, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="header-gradient-border flex items-center justify-between bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <BookOpen className="size-6 text-primary" />
        <span className="text-lg font-bold text-foreground">
          えいご絵本リーダー
        </span>
      </Link>

      {!isLoading && (
        <div className="flex items-center">
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted/80"
            >
              <LogOut className="size-3.5" />
              ログアウト
            </button>
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
