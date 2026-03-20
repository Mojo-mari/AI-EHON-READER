"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type Speed = "slow" | "normal" | "fast";

const speedConfig: Record<Speed, { label: string; icon: string; value: number }> = {
  slow: { label: "ゆっくり", icon: "🐢", value: 0.8 },
  normal: { label: "ふつう", icon: "🐰", value: 1.0 },
  fast: { label: "はやい", icon: "🐎", value: 1.2 },
};

type AudioPlayerProps = {
  text: string;
  speed: Speed;
  onSpeedChange: (speed: Speed) => void;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFinish: () => void;
};

export default function AudioPlayer({
  text,
  speed,
  onSpeedChange,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onFinish,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isLastPage = currentPage >= totalPages - 1;
  const isFirstPage = currentPage === 0;

  // テキストが変わったら以前の音声をクリーンアップ
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const generateAudio = useCallback(async () => {
    if (!text) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          speed: speedConfig[speed].value,
        }),
      });

      if (!response.ok) {
        throw new Error("音声の生成に失敗しました");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // 古いURLをクリーンアップ
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);

      // 再生
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError("音声の再生に失敗しました");
      };
      await audio.play();
      setIsPlaying(true);
    } catch {
      setError("音声の生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }, [text, speed, audioUrl]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      generateAudio();
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying, audioUrl, generateAudio]);

  const handleReplay = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    } else {
      generateAudio();
    }
  }, [audioUrl, generateAudio]);

  const handleSkipForward = useCallback(() => {
    if (isLastPage) {
      onFinish();
    } else {
      onNextPage();
    }
  }, [isLastPage, onFinish, onNextPage]);

  return (
    <div className="w-full max-w-md space-y-4">
      {/* スピード選択 */}
      <div className="flex justify-center gap-2">
        {(Object.keys(speedConfig) as Speed[]).map((key) => (
          <button
            key={key}
            onClick={() => onSpeedChange(key)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
              speed === key
                ? "bg-[#FFD93D] text-[#2D1B69] shadow-md"
                : "bg-white text-[#6B5B95] shadow-sm"
            }`}
          >
            {speedConfig[key].icon} {speedConfig[key].label}
          </button>
        ))}
      </div>

      {/* 再生コントロール */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevPage}
          disabled={isFirstPage}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm transition-transform active:scale-95 disabled:opacity-30"
          title="まえのページ"
        >
          ⏮️
        </button>

        <button
          onClick={handleReplay}
          disabled={isLoading}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          title="もういちど"
        >
          🔄
        </button>

        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF6B6B] text-3xl text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-spin text-2xl">⏳</span>
          ) : isPlaying ? (
            "⏸️"
          ) : (
            "▶️"
          )}
        </button>

        <button
          onClick={handleSkipForward}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm transition-transform active:scale-95"
          title={isLastPage ? "おわり" : "つぎのページ"}
        >
          ⏭️
        </button>
      </div>

      {/* 下部の大きいボタン */}
      {isLastPage ? (
        <button
          onClick={onFinish}
          className="w-full rounded-2xl bg-[#FF6B6B] py-4 text-lg font-bold text-white shadow-md transition-transform active:scale-95"
        >
          📸 あたらしくさつえいする
        </button>
      ) : (
        <button
          onClick={onNextPage}
          className="w-full rounded-2xl bg-[#4ECDC4] py-4 text-lg font-bold text-white shadow-md transition-transform active:scale-95"
        >
          📖 つぎのページへ ({currentPage + 2}/{totalPages})
        </button>
      )}

      {/* エラー表示 */}
      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <p className="text-center text-sm text-[#6B5B95]">
          🎵 おんせいをつくっているよ...
        </p>
      )}
    </div>
  );
}
