import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, speed = 1.0 } = await request.json();

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

    const mp3 = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: processedText,
      speed: speed,
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
