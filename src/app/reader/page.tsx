"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import CameraCapture from "@/components/CameraCapture";
import TextDisplay from "@/components/TextDisplay";
import AudioPlayer from "@/components/AudioPlayer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Frown, Camera, BookMarked, Check, LogIn } from "lucide-react";
import { getBook, saveBook } from "@/lib/bookshelf";
import { saveBookToCloud } from "@/lib/bookshelf-cloud";
import { useAuth } from "@/contexts/AuthContext";
import { getSettings, saveSettings } from "@/lib/settings";

type Speed = "slow" | "normal" | "fast";

type PageResult = {
  english: string;
  japanese: string;
};

type ReaderState =
  | { step: "capture" }
  | { step: "processing"; doneCount: number; totalPages: number }
  | { step: "result"; pages: PageResult[]; currentPage: number; failedCount?: number }
  | { step: "error"; message: string };

function ReaderPageContent() {
  const searchParams = useSearchParams();
  const { user, supabase, signInWithGoogle } = useAuth();
  const [state, setState] = useState<ReaderState>({ step: "capture" });
  const [speed, setSpeed] = useState<Speed>("normal");
  const [isTranslating, setIsTranslating] = useState(false);

  // よみあげ設定（こえ・じどうめくり）。端末に記憶される
  const [voice, setVoice] = useState(() => getSettings().voice);
  const [autoTurn, setAutoTurn] = useState(() => getSettings().autoTurn);
  // 自動めくり直後のページを自動再生するためのフラグ
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  const handleVoiceChange = useCallback((newVoice: string) => {
    setVoice(newVoice);
    saveSettings({ ...getSettings(), voice: newVoice });
  }, []);

  const handleAutoTurnChange = useCallback((newAutoTurn: boolean) => {
    setAutoTurn(newAutoTurn);
    saveSettings({ ...getSettings(), autoTurn: newAutoTurn });
  }, []);

  // 保存UI用のstate
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookColor, setBookColor] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ページごとの音声キャッシュ（テキスト→音声URL）。ページを行き来しても再生成しない
  const audioCacheRef = useRef<Map<string, string>>(new Map());
  const clearAudioCache = useCallback(() => {
    audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioCacheRef.current.clear();
  }, []);

  // 画面を離れるときにキャッシュを解放
  useEffect(() => {
    const cache = audioCacheRef.current;
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  // URLにbookIdがある場合、localStorageから読み込む
  useEffect(() => {
    const bookId = searchParams.get("bookId");
    if (!bookId) return;
    const book = getBook(bookId);
    if (book) {
      setState({ step: "result", pages: book.pages, currentPage: 0 });
      setIsSaved(true);
    }
  }, [searchParams]);

  // 保存フォームを開いたらinputにフォーカス
  useEffect(() => {
    if (showSaveForm) {
      titleInputRef.current?.focus();
    }
  }, [showSaveForm]);

  const handleCapture = useCallback(async (imageDataUrls: string[]) => {
    const totalPages = imageDataUrls.length;
    setState({ step: "processing", doneCount: 0, totalPages });
    setIsSaved(false);
    setShowSaveForm(false);
    setBookTitle("");
    clearAudioCache();

    const results = await Promise.allSettled(
      imageDataUrls.map(async (url, index) => {
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageDataUrls: [url] }),
        });

        if (!response.ok) {
          throw new Error("OCR failed");
        }

        const data = await response.json();

        setState((prev) => {
          if (prev.step === "processing") {
            return { ...prev, doneCount: prev.doneCount + 1 };
          }
          return prev;
        });

        return {
          index,
          english: data.english || "",
          japanese: data.japanese || "",
          title: data.title || "",
          color: data.color || "",
        };
      })
    );

    type PageData = { index: number; english: string; japanese: string; title: string; color: string };
    const allFulfilled = results
      .filter((r): r is PromiseFulfilledResult<PageData> => r.status === "fulfilled")
      .map((r) => r.value)
      .sort((a, b) => a.index - b.index);

    // 表紙など本文のないページも含めてタイトル・カラーを探す
    const detectedTitle = allFulfilled.find((r) => r.title)?.title ?? "";
    if (detectedTitle) setBookTitle(detectedTitle);
    const detectedColor = allFulfilled.find((r) => r.color)?.color ?? "";
    if (detectedColor) setBookColor(detectedColor);

    const successResults = allFulfilled.filter((r) => r.english !== "");
    const failedCount = results.filter((r) => r.status === "rejected").length;

    if (successResults.length === 0) {
      setState({
        step: "error",
        message:
          failedCount > 0
            ? "よみとりちゅうにエラーがおきました。\n電波のよいところで、もういちどためしてね。"
            : "えいごの文がみつかりませんでした。\nもういちど撮影してみてね。",
      });
      return;
    }

    setState({
      step: "result",
      pages: successResults.map(({ english, japanese }) => ({ english, japanese })),
      currentPage: 0,
      failedCount,
    });
  }, [clearAudioCache]);

  const handleNextResultPage = useCallback(() => {
    setState((prev) => {
      if (prev.step === "result" && prev.currentPage < prev.pages.length - 1) {
        return { ...prev, currentPage: prev.currentPage + 1 };
      }
      return prev;
    });
  }, []);

  // じどうめくり: 読み終わったら次のページへ進み、自動で読み始める
  const handleAutoAdvance = useCallback(() => {
    setAutoPlayNext(true);
    handleNextResultPage();
  }, [handleNextResultPage]);

  const handleAutoPlayConsumed = useCallback(() => {
    setAutoPlayNext(false);
  }, []);

  const handlePrevResultPage = useCallback(() => {
    setState((prev) => {
      if (prev.step === "result" && prev.currentPage > 0) {
        return { ...prev, currentPage: prev.currentPage - 1 };
      }
      return prev;
    });
  }, []);

  const handleBackToCapture = useCallback(() => {
    setState({ step: "capture" });
    setIsSaved(false);
    setShowSaveForm(false);
    setBookTitle("");
    setBookColor("");
    clearAudioCache();
  }, [clearAudioCache]);

  const handleTextEdit = useCallback(async (newText: string) => {
    let editedPageIndex = 0;
    setState((prev) => {
      if (prev.step === "result") {
        editedPageIndex = prev.currentPage;
        const updatedPages = [...prev.pages];
        updatedPages[prev.currentPage] = {
          ...updatedPages[prev.currentPage],
          english: newText,
        };
        return { ...prev, pages: updatedPages };
      }
      return prev;
    });

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ english: newText }),
      });
      if (res.ok) {
        const data = await res.json();
        setState((prev) => {
          if (prev.step === "result" && data.japanese) {
            const updatedPages = [...prev.pages];
            updatedPages[editedPageIndex] = {
              ...updatedPages[editedPageIndex],
              japanese: data.japanese,
            };
            return { ...prev, pages: updatedPages };
          }
          return prev;
        });
      }
    } catch {
      // 翻訳失敗しても英文の更新は維持する
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!bookTitle.trim() || state.step !== "result" || !user) return;
    const savedBook = saveBook(bookTitle.trim(), state.pages, bookColor || undefined);
    await saveBookToCloud(supabase, user.id, savedBook);
    setIsSaved(true);
    setShowSaveForm(false);
    setBookTitle("");
    setBookColor("");
  }, [bookTitle, bookColor, state, user, supabase]);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-6">
        {/* ページカウンター */}
        {state.step === "result" && (
          <span className="page-badge mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold text-foreground">
            <BookOpen className="size-4" />
            {state.currentPage + 1} / {state.pages.length} ページめ
          </span>
        )}

        {/* 撮影画面 */}
        {state.step === "capture" && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <CameraCapture onCapture={handleCapture} />
          </div>
        )}

        {/* 読み取り中（進捗表示） */}
        {state.step === "processing" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Search className="size-14 animate-bounce text-secondary" />
            <p className="text-center text-lg font-bold text-foreground">
              もじをよみとっているよ...
            </p>
            <div className="w-48">
              <Progress
                value={state.totalPages > 0 ? (state.doneCount / state.totalPages) * 100 : 0}
                className="[&_[data-slot=progress-track]]:h-3 [&_[data-slot=progress-track]]:rounded-full [&_[data-slot=progress-indicator]]:progress-bar-animated [&_[data-slot=progress-indicator]]:rounded-full"
              />
              <p className="mt-2 text-center text-sm font-bold text-muted-foreground">
                {state.doneCount}/{state.totalPages}ページ よみとりずみ
              </p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {state.step === "result" && (
          <div className="flex w-full flex-1 flex-col items-center gap-6">
            {(state.failedCount ?? 0) > 0 && (
              <p className="w-full max-w-md rounded-xl bg-amber-50 px-4 py-2 text-center text-sm font-bold text-amber-700">
                ⚠️ {state.failedCount}まいのしゃしんはよみとれなかったよ
              </p>
            )}
            <TextDisplay
              key={`text-${state.currentPage}`}
              englishText={state.pages[state.currentPage].english}
              japaneseText={state.pages[state.currentPage].japanese}
              onTextEdit={handleTextEdit}
              isTranslating={isTranslating}
            />
            <AudioPlayer
              key={`audio-${state.currentPage}`}
              text={state.pages[state.currentPage].english}
              nextText={state.pages[state.currentPage + 1]?.english}
              speed={speed}
              onSpeedChange={setSpeed}
              voice={voice}
              onVoiceChange={handleVoiceChange}
              autoTurn={autoTurn}
              onAutoTurnChange={handleAutoTurnChange}
              autoPlayOnMount={autoPlayNext}
              onAutoPlayConsumed={handleAutoPlayConsumed}
              onAutoAdvance={handleAutoAdvance}
              audioCache={audioCacheRef.current}
              currentPage={state.currentPage}
              totalPages={state.pages.length}
              onPrevPage={handlePrevResultPage}
              onNextPage={handleNextResultPage}
              onFinish={handleBackToCapture}
            />

            {/* 本棚に保存 */}
            <div className="w-full max-w-sm pb-4">
              {!user ? (
                <button
                  onClick={signInWithGoogle}
                  className="action-btn flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground"
                >
                  <LogIn className="size-4 text-primary" />
                  ログインするとほんだなに保存できるよ
                </button>
              ) : isSaved ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted px-4 py-3 text-sm font-bold text-muted-foreground">
                  <Check className="size-4 text-secondary" />
                  ほんだなに保存済み
                </div>
              ) : showSaveForm ? (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="mb-2 text-sm font-bold text-foreground">
                    本のタイトルを入力してね
                  </p>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    placeholder="例：はらぺこあおむし"
                    className="mb-3 w-full rounded-xl border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={!bookTitle.trim()}
                      className="btn-cta flex-1 rounded-xl border-none text-sm"
                    >
                      保存する
                    </Button>
                    <Button
                      onClick={() => setShowSaveForm(false)}
                      variant="outline"
                      className="rounded-xl text-sm"
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="action-btn flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground"
                >
                  <BookMarked className="size-4 text-primary" />
                  ほんだなに保存する
                </button>
              )}
            </div>
          </div>
        )}

        {/* エラー画面 */}
        {state.step === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <Frown className="size-14 text-muted-foreground" />
            <p className="whitespace-pre-line text-center text-lg font-bold text-foreground">
              {state.message}
            </p>
            <Button
              onClick={handleBackToCapture}
              size="xl"
              className="btn-cta rounded-full border-none px-8"
            >
              <Camera className="size-5" />
              もういちどとる
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ReaderPage() {
  return (
    <Suspense>
      <ReaderPageContent />
    </Suspense>
  );
}
