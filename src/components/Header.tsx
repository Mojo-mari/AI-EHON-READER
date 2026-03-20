"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">📖</span>
        <span className="text-lg font-bold text-[#2D1B69]">
          えいご絵本リーダー
        </span>
      </Link>
    </header>
  );
}
