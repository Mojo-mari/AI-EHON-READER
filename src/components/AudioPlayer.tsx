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
  Repeat,
  AudioLines,
} from "lucide-react";
import { fetchTtsUrl } from "@/lib/tts-client";
import VoicePicker, { VOICES } from "./VoicePicker";

type Speed = "slow" | "normal" | "fast";

const speedConfig: Record<Speed, { label: string; value: number }> = {
  slow: { label: "ゆっくり", value: 0.7 },
  normal: { label: "ふつう", value: 1.0 },
  fast: { label: "はやい", value: 1.3 },
};

type AudioPlayerProps = {
  text: string;
  /** 次のページの英文（再生中に音声を先読みして、ページ送りを待たせない） */
  nextText?: string;
  speed: Speed;
  onSpeedChange: (speed: Speed) => void;
  voice: string;
  onVoiceChange: (voice: string) => void;
  autoTurn: boolean;
  onAutoTurnChange: (autoTurn: boolean) => void;
  /** 自動めくりで遷移してきた直後にtrue。マウント時に自動再生する */
  autoPlayOnMount?: boolean;
  onAutoPlayConsumed?: () => void;
  /** 読み終わったら次のページへ進んで自動再生する（親が処理） */
  onAutoAdvance: () => void;
  /** テキスト→音声URLのキャッシュ（親が管理。ページを行き来しても再生成しない） */
  audioCache: Map<string, string>;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onFinish: () => void;
};

// iOSでは「ユーザー操作で一度再生したaudio要素」だけが続けて自動再生を許可される。
// 自動ページめくり後も再生できるよう、audio要素を1つだけ作って使い回す。
let sharedAudio: HTMLAudioElement | null = null;
function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) sharedAudio = new Audio();
  return sharedAudio;
}

// じどうめくり: 読み終わってから次のページに進むまでの間（絵を眺める時間）
const AUTO_TURN_DELAY_MS = 3000;

export default function AudioPlayer({
  text,
  nextText,
  speed,
  onSpeedChange,
  voice,
  onVoiceChange,
  autoTurn,
  onAutoTurnChange,
  autoPlayOnMount = false,
  onAutoPlayConsumed,
  onAutoAdvance,
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
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  // じどうめくりの待ち時間中かどうか
  const [isAutoWaiting, setIsAutoWaiting] = useState(false);
  const autoTurnTimerRef = useRef<number | null>(null);

  const isLastPage = currentPage >= totalPages - 1;
  const isFirstPage = currentPage === 0;

  // じどうめくりの待ちをキャンセル（ユーザーが何か操作したとき）
  const cancelAutoTurnWait = useCallback(() => {
    if (autoTurnTimerRef.current !== null) {
      clearTimeout(autoTurnTimerRef.current);
      autoTurnTimerRef.current = null;
    }
    setIsAutoWaiting(false);
  }, []);

  // 再生終了時の処理。最新のprops/stateを参照できるようrefに持つ
  const endedRef = useRef<() => void>(() => {});
  endedRef.current = () => {
    setIsPlaying(false);
    if (autoTurn && !isLastPage) {
      // すぐにめくらず、絵を眺める時間をおいてから次のページへ
      setIsAutoWaiting(true);
      autoTurnTimerRef.current = window.setTimeout(() => {
        autoTurnTimerRef.current = null;
        setIsAutoWaiting(false);
        onAutoAdvance();
      }, AUTO_TURN_DELAY_MS);
    }
  };

  // ページ切替などでアンマウントされたら再生とめくり待ちを止める
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.onended = null;
        audio.onerror = null;
      }
      if (autoTurnTimerRef.current !== null) {
        clearTimeout(autoTurnTimerRef.current);
      }
    };
  }, []);

  // じどうめくりをOFFにしたら待ちも取り消す
  useEffect(() => {
    if (!autoTurn) {
      cancelAutoTurnWait();
    }
  }, [autoTurn, cancelAutoTurnWait]);

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
      const url = await fetchTtsUrl(text, voice, audioCache);

      const audio = getSharedAudio();
      audio.src = url;
      audio.preservesPitch = true;
      audio.defaultPlaybackRate = speedConfig[speed].value;
      audio.playbackRate = speedConfig[speed].value;
      audio.onended = () => endedRef.current();
      audio.onerror = () => {
        setIsPlaying(false);
        setError("音声の再生に失敗しました");
      };
      audioRef.current = audio;
      await audio.play();
      setHasAudio(true);
      setIsPlaying(true);
    } catch {
      setError("音声の生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
    }
  }, [text, voice, speed, audioCache]);

  // 自動めくりで来たページは自動で読み始める
  useEffect(() => {
    if (autoPlayOnMount) {
      onAutoPlayConsumed?.();
      generateAudio();
    }
    // マウント時に1回だけ判定する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 再生が始まったら、次のページの音声を裏で先読みしておく
  useEffect(() => {
    if (isPlaying && nextText) {
      fetchTtsUrl(nextText, voice, audioCache).catch(() => {});
    }
  }, [isPlaying, nextText, voice, audioCache]);

  // こえが変わったら今の音声を破棄（次の再生で新しいこえになる）
  const prevVoiceRef = useRef(voice);
  useEffect(() => {
    if (prevVoiceRef.current !== voice) {
      prevVoiceRef.current = voice;
      audioRef.current?.pause();
      setIsPlaying(false);
      setHasAudio(false);
    }
  }, [voice]);

  const handlePlayPause = useCallback(() => {
    cancelAutoTurnWait();
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
  }, [isPlaying, hasAudio, generateAudio, cancelAutoTurnWait]);

  const handleReplay = useCallback(() => {
    cancelAutoTurnWait();
    const audio = audioRef.current;
    if (audio && hasAudio) {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
    } else {
      generateAudio();
    }
  }, [hasAudio, generateAudio, cancelAutoTurnWait]);

  const handleSkipForward = useCallback(() => {
    if (isLastPage) {
      onFinish();
    } else {
      onNextPage();
    }
  }, [isLastPage, onFinish, onNextPage]);

  const handleOpenVoicePicker = useCallback(() => {
    // ためしぎきと重ならないよう、本文の再生は止める
    cancelAutoTurnWait();
    audioRef.current?.pause();
    setIsPlaying(false);
    setShowVoicePicker(true);
  }, [cancelAutoTurnWait]);

  const currentVoiceName =
    VOICES.find((v) => v.id === voice)?.name ?? voice;

  return (
    <div className="w-full max-w-md space-y-4">
      {/* こえ・じどうめくり */}
      <div className="flex justify-center gap-2">
        <button
          onClick={handleOpenVoicePicker}
          className="action-btn flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground shadow-sm"
        >
          <AudioLines className="size-4" />
          こえ: {currentVoiceName}
        </button>
        <button
          onClick={() => onAutoTurnChange(!autoTurn)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
            autoTurn
              ? "speed-active"
              : "action-btn bg-card text-muted-foreground shadow-sm"
          }`}
        >
          <Repeat className="size-4" />
          じどうめくり{autoTurn ? " ON" : ""}
        </button>
      </div>

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
        <div className={`flex flex-col items-center gap-1 ${isFirstPage ? "opacity-30" : ""}`}>
          <button
            onClick={onPrevPage}
            disabled={isFirstPage}
            className="control-btn flex h-12 w-12 items-center justify-center rounded-full"
            title="まえのページ"
          >
            <SkipBack className="size-5" />
          </button>
          <span className="text-[10px] font-bold text-muted-foreground">まえ</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleReplay}
            disabled={isLoading}
            className="control-btn flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-50"
            title="もういちど"
          >
            <RotateCcw className="size-5" />
          </button>
          <span className="text-[10px] font-bold text-muted-foreground">もういちど</span>
        </div>

        <div className="flex flex-col items-center gap-1">
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
          {/* 円の高さを左右のボタンと揃えるための透明ラベル */}
          <span className="invisible text-[10px] font-bold">·</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleSkipForward}
            className="control-btn flex h-12 w-12 items-center justify-center rounded-full"
            title={isLastPage ? "おわり" : "つぎのページ"}
          >
            <SkipForward className="size-5" />
          </button>
          <span className="text-[10px] font-bold text-muted-foreground">
            {isLastPage ? "おわり" : "つぎ"}
          </span>
        </div>
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

      {/* じどうめくり待ち表示 */}
      {isAutoWaiting && (
        <p className="flex animate-pulse items-center justify-center gap-1.5 text-center text-sm font-bold text-secondary">
          <BookOpen className="size-4" />
          もうすぐ つぎのページ...
        </p>
      )}

      {/* こえ選択ダイアログ */}
      <VoicePicker
        open={showVoicePicker}
        onOpenChange={setShowVoicePicker}
        voice={voice}
        onVoiceChange={onVoiceChange}
      />
    </div>
  );
}
