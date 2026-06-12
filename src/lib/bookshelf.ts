export type SavedBook = {
  id: string;
  title: string;
  pages: { english: string; japanese: string }[];
  savedAt: string; // ISO 8601
  color?: string; // テーマカラー（Tailwindカラー名）
};

const STORAGE_KEY = "bookshelf";
const UPDATE_EVENT = "bookshelf-updated";

function notifyUpdated(): void {
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

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
  notifyUpdated();
  return newBook;
}

export function deleteBook(id: string): void {
  const books = getBooks().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  notifyUpdated();
}

// クラウドから取得した本棚で丸ごと置き換える（ログイン時の同期用）
export function replaceBooks(books: SavedBook[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  notifyUpdated();
}

// ログアウト時に呼ぶ。共有端末で次にログインした別ユーザーの
// アカウントへ前のユーザーの本が同期されてしまうのを防ぐ
export function clearBooks(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyUpdated();
}

// ---- useSyncExternalStore 用 ----

// スナップショットは同じ内容なら同じ配列参照を返す必要がある
let snapshotRaw: string | null = null;
let snapshotBooks: SavedBook[] = [];

export function getBooksSnapshot(): SavedBook[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== snapshotRaw) {
    snapshotRaw = raw;
    try {
      snapshotBooks = raw ? (JSON.parse(raw) as SavedBook[]) : [];
    } catch {
      snapshotBooks = [];
    }
  }
  return snapshotBooks;
}

const EMPTY_BOOKS: SavedBook[] = [];

export function getServerBooksSnapshot(): SavedBook[] {
  return EMPTY_BOOKS;
}

export function subscribeBookshelf(callback: () => void): () => void {
  window.addEventListener(UPDATE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UPDATE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
