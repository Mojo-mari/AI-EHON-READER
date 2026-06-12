import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ALLOWED_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
]);

export async function POST(request: NextRequest) {
  try {
    const { text, voice } = await request.json();
    const selectedVoice = ALLOWED_VOICES.has(voice) ? voice : "coral";

    if (!text) {
      return NextResponse.json(
        { error: "テキストがありません" },
        { status: 400 }
      );
    }

    // "..." で終わるテキストをTTSが「未完成の文」と判断して
    // 最後の単語を読み飛ばすのを防ぐため、末尾の "..." を "…。" に変換する。
    // "…"（Unicode単一文字）にすることでTTSが自然な間として扱い、
    // "。" を末尾に付けることで文の終端を明示して読み飛ばしを防止する。
    const processedText = text.replace(/\.{3,}/g, "…").replace(/…\s*$/, "… .");

    // 速度調整はクライアント側の playbackRate で行う
    // （gpt-4o-mini-tts は speed パラメータ非対応のため）
    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: selectedVoice,
      input: processedText,
      instructions:
        "You are reading an English picture book aloud to young children. " +
        "Read with warm, expressive intonation and gentle enthusiasm. " +
        "Vary your pitch and pacing naturally, emphasize key words, " +
        "and pause slightly between sentences. " +
        "Sound like a friendly, encouraging storyteller. " +
        "You must read every single word in the input text exactly as written. " +
        "Never skip or omit any words. Read the last word clearly even if followed by an ellipsis.",
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "音声の生成に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
