"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import CameraCapture from "@/components/CameraCapture";
import TextDisplay from "@/components/TextDisplay";
import AudioPlayer from "@/components/AudioPlayer";

type Speed = "slow" | "normal" | "fast";

type PageResult = {
  english: string;
  japanese: string;
};

type ReaderState =
  | { step: "capture" }
  | { step: "processing"; doneCount: number; totalPages: number }
  | { step: "result"; pages: PageResult[]; currentPage: number }
  | { step: "error"; message: string };

export default function ReaderPage() {
  const [state, setState] = useState<ReaderState>({ step: "capture" });
  const [speed, setSpeed] = useState<Speed>("normal");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleCapture = useCallback(async (imageDataUrls: string[]) => {
    const totalPages = imageDataUrls.length;
    setState({ step: "processing", doneCount: 0, totalPages });

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
        };
      })
    );

    // 成功したページだけ集める（元の順序を維持）
    const successPages = results
      .filter(
        (r): r is PromiseFulfilledResult<{ index: number; english: string; japanese: string }> =>
          r.status === "fulfilled" && r.value.english !== ""
      )
      .map((r) => r.value)
      .sort((a, b) => a.index - b.index)
      .map(({ english, japanese }) => ({ english, japanese }));

    if (successPages.length === 0) {
      setState({
        step: "error",
        message: "えいごの文がみつかりませんでした。\nもういちど撮影してみてね。",
      });
      return;
    }

    setState({
      step: "result",
      pages: successPages,
      currentPage: 0,
    });
  }, []);

  const handleNextResultPage = useCallback(() => {
    setState((prev) => {
      if (prev.step === "result" && prev.currentPage < prev.pages.length - 1) {
        return { ...prev, currentPage: prev.currentPage + 1 };
      }
      return prev;
    });
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
  }, []);

  const handleTextEdit = useCallback(async (newText: string) => {
    // まず英文をすぐに反映
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

    // 日本語訳を再取得
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

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF8F0]">
      <Header />

      <main className="flex flex-1 flex-col items-center px-4 py-6">
        {/* ページカウンター */}
        {state.step === "result" && (
          <div className="mb-4 rounded-full bg-[#FFD93D]/30 px-4 py-1 text-sm font-bold text-[#2D1B69]">
            📖 {state.currentPage + 1} / {state.pages.length} ページめ
          </div>
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
            <div className="text-6xl animate-bounce">🔍</div>
            <p className="text-center text-lg font-bold text-[#2D1B69]">
              もじをよみとっているよ...
            </p>
            {/* 進捗バー */}
            <div className="w-48">
              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#4ECDC4] transition-all duration-300"
                  style={{
                    width: `${state.totalPages > 0 ? (state.doneCount / state.totalPages) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-2 text-center text-sm font-bold text-[#6B5B95]">
                {state.doneCount}/{state.totalPages}ページ よみとりずみ
              </p>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {state.step === "result" && (
          <div className="flex w-full flex-1 flex-col items-center gap-6">
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
              speed={speed}
              onSpeedChange={setSpeed}
              currentPage={state.currentPage}
              totalPages={state.pages.length}
              onPrevPage={handlePrevResultPage}
              onNextPage={handleNextResultPage}
              onFinish={handleBackToCapture}
            />
          </div>
        )}

        {/* エラー画面 */}
        {state.step === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <div className="text-6xl">😢</div>
            <p className="whitespace-pre-line text-center text-lg font-bold text-[#2D1B69]">
              {state.message}
            </p>
            <button
              onClick={handleBackToCapture}
              className="rounded-full bg-[#FF6B6B] px-8 py-3 text-lg font-bold text-white shadow-md transition-transform active:scale-95"
            >
              📸 もういちどとる
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
