"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  SkipBack,
  SkipForward,
  RotateCcw,
  Play,
  Pause,
  Loader2,
  Camera,
  BookOpen,
  Music,
} from "lucide-react";

type Speed = "slow" | "normal" | "fast";

const speedConfig: Record<Speed, { label: string; value: number }> = {
  slow: { label: "ゆっくり", value: 0.7 },
  normal: { label: "ふつう", value: 1.0 },
  fast: { label: "はやい", value: 1.3 },
};

type AudioPlayerProps = {
  text: string;
  speed: Speed;
  onSpeedChange: (speed: Speed) => void;
  /** テキスト→音声URLのキャッシュ（親が管理。ページを行き来しても再生成しない） */
  audioCache: Map<string, string>;
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
  audioCache,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onFinish,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLastPage = currentPage >= totalPages - 1;
  const isFirstPage = currentPage === 0;

  // ページ切替などでアンマウントされたら再生を止める
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  // 速度変更: 再生中でもその場で反映（preservesPitchで声の高さは変わらない）
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speedConfig[speed].value;
    }
  }, [speed]);

  const generateAudio = useCallback(async () => {
    if (!text) return;

    setIsLoading(true);
    setError(null);

    try {
      let url = audioCache.get(text);

      if (!url) {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error("音声の生成に失敗しました");
        }

        const blob = await response.blob();
        url = URL.createObjectURL(blob);
        audioCache.set(text, url);
      }

      const audio = new Audio(url);
      audio.preservesPitch = true;
      audio.playbackRate = speedConfig[speed].value;
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setError("音声の再生に失敗しました");
      };
      await audio.play();
      setHasAudio(true);
      setIsPlaying(true);
    } catch {
      setError("音声の生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }, [text, speed, audioCache]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) {
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
  }, [isPlaying, hasAudio, generateAudio]);

  const handleReplay = useCallback(() => {
    const audio = audioRef.current;
    if (audio && hasAudio) {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    } else {
      generateAudio();
    }
  }, [hasAudio, generateAudio]);

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
                ? "speed-active"
                : "action-btn bg-card text-muted-foreground shadow-sm"
            }`}
          >
            {speedConfig[key].label}
          </button>
        ))}
      </div>

      {/* 再生コントロール */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevPage}
          disabled={isFirstPage}
          className="control-btn flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-30"
          title="まえのページ"
        >
          <SkipBack className="size-5" />
        </button>

        <button
          onClick={handleReplay}
          disabled={isLoading}
          className="control-btn flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-50"
          title="もういちど"
        >
          <RotateCcw className="size-5" />
        </button>

        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="play-btn flex h-16 w-16 items-center justify-center rounded-full text-white disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="size-7 animate-spin" />
          ) : isPlaying ? (
            <Pause className="size-7" />
          ) : (
            <Play className="size-7" />
          )}
        </button>

        <button
          onClick={handleSkipForward}
          className="control-btn flex h-12 w-12 items-center justify-center rounded-full"
          title={isLastPage ? "おわり" : "つぎのページ"}
        >
          <SkipForward className="size-5" />
        </button>
      </div>

      {/* 下部の大きいボタン */}
      {isLastPage ? (
        <button
          onClick={onFinish}
          className="btn-cta flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-white"
        >
          <Camera className="size-5" />
          あたらしくさつえいする
        </button>
      ) : (
        <button
          onClick={onNextPage}
          className="btn-secondary-gradient flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-white"
        >
          <BookOpen className="size-5" />
          つぎのページへ ({currentPage + 2}/{totalPages})
        </button>
      )}

      {/* エラー表示 */}
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}

      {/* ローディング表示 */}
      {isLoading && (
        <p className="flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
          <Music className="size-4" />
          おんせいをつくっているよ...
        </p>
      )}
    </div>
  );
}
