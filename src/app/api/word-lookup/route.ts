import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { word, context } = await request.json();

    if (!word || typeof word !== "string") {
      return NextResponse.json(
        { error: "単語がありません" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are a dictionary for young children learning English.
Given an English word and the sentence it appears in, provide the Japanese meaning of THAT EXACT WORD as used in the sentence.

Rules:
- Return ONLY the meaning of the specified word, never the meaning of another word
- Use the sentence to determine which sense/meaning of the word is correct
  Example: "lot" in "Pick a tree from the lot" → lot means a place where things are sold/displayed → うりば
  Example: "lot" in "a lot of people" → lot means たくさん
  Example: "run" in "run a shop" → けいえいする
  Example: "run" in "run fast" → はしる
- Write in hiragana (children cannot read kanji)
- Keep it short: 1-3 words maximum
- Common prepositions/articles: from=〜から, to=〜へ/〜に, the/a=(nothing special), in=〜のなかに, on=〜のうえに, at=〜で, of=〜の, with=〜といっしょに
- Proper nouns: write in katakana

Respond in this exact JSON format:
{"japanese": "にほんごやく"}`,
        },
        {
          role: "user",
          content: `Word: "${word}"\nSentence: "${context || word}"`,
        },
      ],
      max_tokens: 100,
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
    console.error("Word lookup error:", error);
    return NextResponse.json(
      { error: "単語の検索に失敗しました" },
      { status: 500 }
    );
  }
}
