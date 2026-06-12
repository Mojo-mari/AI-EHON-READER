// TTS音声の取得とキャッシュ（テキスト＋こえ → 音声URL）

// 同じ音声への同時リクエストをまとめる（再生とプリフェッチの重複防止）
const inflight = new Map<string, Promise<string>>();

export async function fetchTtsUrl(
  text: string,
  voice: string,
  cache: Map<string, string>
): Promise<string> {
  const key = `${voice}|${text}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!response.ok) {
        throw new Error("音声の生成に失敗しました");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      cache.set(key, url);
      return url;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
