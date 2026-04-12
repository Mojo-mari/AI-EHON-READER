"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2, LogIn } from "lucide-react";
import { getBooks, deleteBook, type SavedBook } from "@/lib/bookshelf";
import { deleteBookFromCloud } from "@/lib/bookshelf-cloud";
import { useAuth } from "@/contexts/AuthContext";

const COLOR_MAP: Record<string, string> = {
  rose:    "#fb7185",
  orange:  "#fb923c",
  amber:   "#fbbf24",
  yellow:  "#facc15",
  lime:    "#a3e635",
  emerald: "#34d399",
  teal:    "#2dd4bf",
  sky:     "#38bdf8",
  blue:    "#60a5fa",
  violet:  "#a78bfa",
  purple:  "#c084fc",
  pink:    "#f472b6",
};

const FALLBACK_COLORS = Object.values(COLOR_MAP);

function getBookColor(book: SavedBook): string {
  if (book.color && COLOR_MAP[book.color]) return COLOR_MAP[book.color];
  // タイトルのハッシュからフォールバックカラーを決定
  let hash = 0;
  for (const c of book.title) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export default function BookshelfSection() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const { user, supabase, signInWithGoogle } = useAuth();

  useEffect(() => {
    setBooks(getBooks());

    // ログイン時などにクラウドからデータを取得した後、このイベントで再読み込み
    const handleUpdate = () => setBooks(getBooks());
    window.addEventListener("bookshelf-updated", handleUpdate);
    return () => window.removeEventListener("bookshelf-updated", handleUpdate);
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteBook(id);
    setBooks(getBooks());

    // ログイン中はクラウドからも削除
    if (user) {
      await deleteBookFromCloud(supabase, id);
    }
  };

  return (
    <div className="mb-8 w-full max-w-sm rounded-3xl bg-primary/5 px-5 py-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
        <BookOpen className="size-5 text-primary" />
        ほんだな
      </h2>

      {!user ? (
        <button
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-card px-4 py-5 text-sm font-bold text-primary transition-colors hover:bg-primary/5 active:scale-95"
        >
          <LogIn className="size-4" />
          ログインするとほんだなが使えるよ
        </button>
      ) : books.length === 0 ? (
        <div className="rounded-2xl bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          <BookOpen className="mx-auto mb-2 size-8 text-muted-foreground/30" />
          まだ保存された本はないよ
          <br />
          よんだあとに保存してね
        </div>
      ) : (
        <div className="space-y-2">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/reader?bookId=${book.id}`}
              className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: getBookColor(book) }}
                >
                  {book.title.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {book.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {book.pages.length}ページ
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(book.id, e)}
                className="ml-3 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="削除"
              >
                <Trash2 className="size-4" />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
