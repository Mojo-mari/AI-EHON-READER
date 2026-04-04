"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2 } from "lucide-react";
import { getBooks, deleteBook, type SavedBook } from "@/lib/bookshelf";
import { deleteBookFromCloud } from "@/lib/bookshelf-cloud";
import { useAuth } from "@/contexts/AuthContext";

export default function BookshelfSection() {
  const [books, setBooks] = useState<SavedBook[]>([]);
  const { user, supabase } = useAuth();

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
    <div className="mb-8 w-full max-w-sm">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
        <BookOpen className="size-4" />
        ほんだな
        {user && (
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            クラウド保存中
          </span>
        )}
      </h2>
      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          まだ保存された本はありません
          <br />
          絵本を読んだあとに保存してね
        </div>
      ) : null}

      <div className="space-y-2">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/reader?bookId=${book.id}`}
            className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {book.pages.length}ページ
              </p>
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
    </div>
  );
}
