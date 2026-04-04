"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  syncLocalBooksToCloud,
  fetchCloudBooks,
} from "@/lib/bookshelf-cloud";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  supabase: SupabaseClient;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const supabaseClient = createClient();

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  supabase: supabaseClient,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = supabaseClient;

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (event === "SIGNED_IN" && newUser) {
        // ローカルのデータをクラウドに移行してから、クラウドの最新データを取得
        await syncLocalBooksToCloud(supabase, newUser.id);
        const cloudBooks = await fetchCloudBooks(supabase);
        localStorage.setItem("bookshelf", JSON.stringify(cloudBooks));
        // BookshelfSectionに更新を通知
        window.dispatchEvent(new Event("bookshelf-updated"));
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, supabase, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
