import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrls } = await request.json();

    if (!imageDataUrls || !Array.isArray(imageDataUrls) || imageDataUrls.length === 0) {
      return NextResponse.json(
        { error: "画像データがありません" },
        { status: 400 }
      );
    }

    const imageContents = imageDataUrls.map((url: string) => ({
      type: "image_url" as const,
      image_url: {
        url,
        detail: "high" as const,
      },
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an OCR assistant specialized in reading children's picture books.

Your task is to extract ONLY the **main story text** (narrative/body text) from picture book pages.

IMPORTANT - DO NOT extract:
- Text that appears INSIDE illustrations (e.g. signs, labels, banners, posters, shop names, letters within the art)
- Decorative or stylistic text that is part of the artwork
- Page numbers, titles, or headers

ONLY extract:
- The story/narrative text, usually printed in a consistent font in a text area (often at the top, bottom, or side of the page, separate from the illustration)

If there are multiple images, combine the text in order.
Also provide a natural Japanese translation suitable for children.

Respond in this exact JSON format:
{"english": "the extracted story text", "japanese": "日本語訳"}

If there is no story text visible in the images, respond with:
{"english": "", "japanese": ""}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract the English text from these picture book pages and provide a Japanese translation.",
            },
            ...imageContents,
          ],
        },
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "テキストを読み取れませんでした" },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);

    return NextResponse.json({
      english: result.english || "",
      japanese: result.japanese || "",
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "文字の読み取りに失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}
