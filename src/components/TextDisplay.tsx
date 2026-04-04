"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, ChevronRight, Volume2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

type TextDisplayProps = {
  englishText: string;
  japaneseText: string;
  onTextEdit: (newText: string) => void;
  isTranslating?: boolean;
};

type WordPopup = {
  wordIndex: number;
  word: string;
  japanese: string | null; // null = ローディング中
};

export default function TextDisplay({
  englishText,
  japaneseText,
  onTextEdit,
  isTranslating = false,
}: TextDisplayProps) {
  const [showJapanese, setShowJapanese] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(englishText);
  const [activePopup, setActivePopup] = useState<WordPopup | null>(null);
  const wordCacheRef = useRef<Map<string, string>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSaveEdit = () => {
    onTextEdit(editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(englishText);
    setIsEditing(false);
  };

  // 外側タップでポップアップを閉じる
  useEffect(() => {
    if (!activePopup) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".word-meaning-bar") && !target.closest(".tappable-word")) {
        setActivePopup(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [activePopup]);

  // Web Speech API で発音
  const speak = useCallback((word: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, []);

  // 単語タップ時の処理
  const handleWordTap = useCallback(
    async (word: string, index: number) => {
      // 同じ単語を再タップしたら閉じる
      if (activePopup?.wordIndex === index) {
        setActivePopup(null);
        return;
      }

      // 発音（即座に）
      const cleanWord = word.replace(/[^a-zA-Z'-]/g, "");
      if (cleanWord) {
        speak(cleanWord);
      }

      const displayWord = cleanWord || word;
      const cacheKey = displayWord.toLowerCase();

      // キャッシュにあればAPIを呼ばず即表示
      const cached = wordCacheRef.current.get(cacheKey);
      if (cached) {
        setActivePopup({ wordIndex: index, word: displayWord, japanese: cached });
        return;
      }

      // ポップアップ表示（ローディング状態）
      setActivePopup({ wordIndex: index, word: displayWord, japanese: null });

      // 日本語訳を取得
      try {
        const res = await fetch("/api/word-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: cleanWord, context: englishText }),
        });

        if (res.ok) {
          const data = await res.json();
          const japanese = data.japanese || "？";
          // キャッシュに保存
          wordCacheRef.current.set(cacheKey, japanese);
          setActivePopup((prev) => {
            if (prev?.wordIndex === index) {
              return { ...prev, japanese };
            }
            return prev;
          });
        } else {
          setActivePopup((prev) => {
            if (prev?.wordIndex === index) {
              return { ...prev, japanese: "？" };
            }
            return prev;
          });
        }
      } catch {
        setActivePopup((prev) => {
          if (prev?.wordIndex === index) {
            return { ...prev, japanese: "？" };
          }
          return prev;
        });
      }
    },
    [activePopup, speak, englishText]
  );

  // テキストを単語に分割（空白で分割、句読点も保持）
  const words = englishText.split(/(\s+)/);

  return (
    <div className="w-full max-w-md space-y-3" ref={containerRef}>
      {/* 英語テキスト */}
      <div className="soft-card rounded-2xl bg-card p-5 border-l-4 border-l-secondary">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-secondary">EN - English</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Volume2 className="size-3" />
              タップでおんせい
            </span>
            {!isEditing && (
              <button
                onClick={() => {
                  setEditText(englishText);
                  setIsEditing(true);
                  setActivePopup(null);
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
              >
                <Pencil className="size-3" />
                しゅうせい
              </button>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-xl border-2 border-secondary bg-background p-3 text-lg leading-relaxed text-foreground outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="action-btn rounded-full bg-muted px-4 py-2 text-sm font-bold text-muted-foreground"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                className="action-btn rounded-full bg-secondary px-4 py-2 text-sm font-bold text-white"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xl leading-relaxed text-foreground">
              {words.map((token, index) => {
                // 空白はそのまま出力
                if (/^\s+$/.test(token)) {
                  return <span key={index}>{token}</span>;
                }

                const isActive = activePopup?.wordIndex === index;

                return (
                  <span
                    key={index}
                    className={`tappable-word cursor-pointer ${
                      isActive ? "tappable-word-active" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWordTap(token, index);
                    }}
                  >
                    {token}
                  </span>
                );
              })}
            </p>
            {/* 単語の意味：英文の下に固定エリアで表示 */}
            {activePopup && (
              <div className="word-meaning-bar" onClick={(e) => e.stopPropagation()}>
                <span className="word-meaning-word">{activePopup.word}</span>
                <span className="word-meaning-arrow">→</span>
                {activePopup.japanese === null ? (
                  <span className="word-meaning-loading">しらべてるよ...</span>
                ) : (
                  <span className="word-meaning-japanese">{activePopup.japanese}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 日本語訳トグル */}
      <Collapsible open={showJapanese} onOpenChange={setShowJapanese}>
        <div className="soft-card rounded-2xl bg-card border-l-4 border-l-primary">
          <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left">
            <span className="text-sm font-bold text-primary">
              JP - にほんごやく
            </span>
            <ChevronRight
              className="size-5 text-muted-foreground transition-transform duration-200"
              style={{ transform: showJapanese ? "rotate(90deg)" : "rotate(0deg)" }}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden transition-all data-[ending-style]:h-0 data-[starting-style]:h-0">
            <div className="px-5 pb-4">
              {isTranslating ? (
                <p className="text-sm text-muted-foreground animate-pulse">
                  にほんごやくを こうしんちゅう...
                </p>
              ) : (
                <p className="text-lg leading-relaxed text-foreground">
                  {japaneseText}
                </p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
