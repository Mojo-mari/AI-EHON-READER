"use client";

import { useRef, useState } from "react";
import { Volume2, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchTtsUrl } from "@/lib/tts-client";

export type VoiceOption = {
  id: string;
  name: string;
  description: string;
};

export const VOICES: VoiceOption[] = [
  { id: "coral", name: "コーラル", description: "やさしいおねえさん（いつもの声）" },
  { id: "nova", name: "ノヴァ", description: "あかるいおねえさん" },
  { id: "shimmer", name: "シマー", description: "おちついたおねえさん" },
  { id: "fable", name: "フェイブル", description: "ものがたりのおにいさん" },
  { id: "ash", name: "アッシュ", description: "たのもしいおにいさん" },
  { id: "onyx", name: "オニキス", description: "ふかみのあるおとうさん" },
];

const PREVIEW_TEXT = "Hello! Let's read a story together.";

// 試聴音声のキャッシュ（一度聞いた声はAPIを呼ばない）
const previewCache = new Map<string, string>();

type VoicePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voice: string;
  onVoiceChange: (voice: string) => void;
};

export default function VoicePicker({
  open,
  onOpenChange,
  voice,
  onVoiceChange,
}: VoicePickerProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setPlayingId(null);
  };

  const handlePreview = async (id: string) => {
    stopPreview();
    setLoadingId(id);
    try {
      const url = await fetchTtsUrl(PREVIEW_TEXT, id, previewCache);
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.onended = () => setPlayingId(null);
      await audio.play();
      setPlayingId(id);
    } catch {
      // 試聴に失敗しても選択はできるので何もしない
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) stopPreview();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-5">
        <DialogTitle className="text-center text-lg font-bold text-foreground">
          よみあげる こえをえらぶ
        </DialogTitle>
        <div className="space-y-2">
          {VOICES.map((v) => {
            const isSelected = v.id === voice;
            return (
              <div
                key={v.id}
                className={`flex items-center gap-2 rounded-2xl border-2 px-3 py-2.5 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <button
                  onClick={() => onVoiceChange(v.id)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none"
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">
                      {v.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {v.description}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => handlePreview(v.id)}
                  disabled={loadingId !== null}
                  className={`action-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    playingId === v.id
                      ? "bg-secondary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                  aria-label={`${v.name}をためしぎき`}
                  title="ためしぎき"
                >
                  {loadingId === v.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => handleOpenChange(false)}
          className="btn-cta w-full rounded-2xl border-none py-3 text-base font-bold text-white"
        >
          きめた！
        </button>
      </DialogContent>
    </Dialog>
  );
}
