"use client";

import { useState } from "react";

type TextDisplayProps = {
  englishText: string;
  japaneseText: string;
  onTextEdit: (newText: string) => void;
  isTranslating?: boolean;
};

export default function TextDisplay({
  englishText,
  japaneseText,
  onTextEdit,
  isTranslating = false,
}: TextDisplayProps) {
  const [showJapanese, setShowJapanese] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(englishText);

  const handleSaveEdit = () => {
    onTextEdit(editText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(englishText);
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-md space-y-3">
      {/* 英語テキスト */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-[#4ECDC4]">🇬🇧 English</span>
          {!isEditing && (
            <button
              onClick={() => {
                setEditText(englishText);
                setIsEditing(true);
              }}
              className="text-xs text-[#6B5B95] underline"
            >
              ✏️ しゅうせい
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-xl border-2 border-[#4ECDC4] p-3 text-lg leading-relaxed text-[#2D1B69] focus:outline-none"
              rows={4}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="rounded-full bg-gray-200 px-4 py-2 text-sm font-bold text-gray-600"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-full bg-[#4ECDC4] px-4 py-2 text-sm font-bold text-white"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xl leading-relaxed text-[#2D1B69]">
            {englishText}
          </p>
        )}
      </div>

      {/* 日本語訳トグル */}
      <button
        onClick={() => setShowJapanese(!showJapanese)}
        className="w-full rounded-2xl bg-white p-4 text-left shadow-sm transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#FF6B6B]">
            🇯🇵 にほんごやく
          </span>
          <span className="text-lg">{showJapanese ? "🔽" : "▶️"}</span>
        </div>
        {showJapanese && (
          isTranslating ? (
            <p className="mt-2 text-sm text-[#6B5B95] animate-pulse">
              にほんごやくを こうしんちゅう...
            </p>
          ) : (
            <p className="mt-2 text-lg leading-relaxed text-[#2D1B69]">
              {japaneseText}
            </p>
          )
        )}
      </button>
    </div>
  );
}
