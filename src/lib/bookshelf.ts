export type SavedBook = {
  id: string;
  title: string;
  pages: { english: string; japanese: string }[];
  savedAt: string; // ISO 8601
  color?: string; // テーマカラー（Tailwindカラー名）
};

const STORAGE_KEY = "bookshelf";

export function getBooks(): SavedBook[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as SavedBook[]) : [];
  } catch {
    return [];
  }
}

export function getBook(id: string): SavedBook | undefined {
  return getBooks().find((b) => b.id === id);
}

export function saveBook(
  title: string,
  pages: { english: string; japanese: string }[],
  color?: string
): SavedBook {
  const books = getBooks();
  const newBook: SavedBook = {
    id: crypto.randomUUID(),
    title,
    pages,
    savedAt: new Date().toISOString(),
    color,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newBook, ...books]));
  return newBook;
}

export function deleteBook(id: string): void {
  const books = getBooks().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}
