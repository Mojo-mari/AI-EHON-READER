import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { english } = await request.json();

    if (!english || typeof english !== "string") {
      return NextResponse.json(
        { error: "英文テキストがありません" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a translator for children's picture books.
Translate the given English text into natural, easy-to-understand Japanese suitable for children.

Respond in this exact JSON format:
{"japanese": "日本語訳"}`,
        },
        {
          role: "user",
          content: english,
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "翻訳に失敗しました" },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);

    return NextResponse.json({
      japanese: result.japanese || "",
    });
  } catch (error) {
    console.error("Translate error:", error);
    return NextResponse.json(
      { error: "翻訳に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
