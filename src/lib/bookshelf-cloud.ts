import type { SupabaseClient } from "@supabase/supabase-js";
import { type SavedBook, getBooks } from "./bookshelf";

type CloudBook = {
  id: string;
  user_id: string;
  title: string;
  pages: { english: string; japanese: string }[];
  saved_at: string;
};

// クラウドから本棚を取得
export async function fetchCloudBooks(
  supabase: SupabaseClient
): Promise<SavedBook[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("saved_at", { ascending: false });

  if (error || !data) return [];

  return data.map((b: CloudBook) => ({
    id: b.id,
    title: b.title,
    pages: b.pages,
    savedAt: b.saved_at,
  }));
}

// ローカルにしかない本をクラウドにアップロード（初回ログイン時のデータ移行）
export async function syncLocalBooksToCloud(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const localBooks = getBooks();
  if (localBooks.length === 0) return;

  const { data: existingBooks } = await supabase
    .from("books")
    .select("id");

  const existingIds = new Set(
    (existingBooks || []).map((b: { id: string }) => b.id)
  );

  const newBooks = localBooks.filter((b) => !existingIds.has(b.id));
  if (newBooks.length === 0) return;

  await supabase.from("books").insert(
    newBooks.map((b) => ({
      id: b.id,
      user_id: userId,
      title: b.title,
      pages: b.pages,
      saved_at: b.savedAt,
    }))
  );
}

// 本をクラウドに保存
export async function saveBookToCloud(
  supabase: SupabaseClient,
  userId: string,
  book: SavedBook
): Promise<void> {
  await supabase.from("books").upsert({
    id: book.id,
    user_id: userId,
    title: book.title,
    pages: book.pages,
    saved_at: book.savedAt,
  });
}

// 本をクラウドから削除
export async function deleteBookFromCloud(
  supabase: SupabaseClient,
  bookId: string
): Promise<void> {
  await supabase.from("books").delete().eq("id", bookId);
}
