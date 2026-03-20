import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* タイトルエリア */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-6xl">📖</div>
        <h1 className="mb-2 text-3xl font-bold text-[#2D1B69]">
          えいご絵本リーダー
        </h1>
        <p className="text-lg text-[#6B5B95]">
          えほんをカメラでとるだけ！
          <br />
          AIがきれいなえいごで
          <br />
          よみあげてくれるよ
        </p>
      </div>

      {/* 使い方の説明 */}
      <div className="mb-10 w-full max-w-sm space-y-4">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="text-3xl">📸</span>
          <div>
            <p className="font-bold text-[#2D1B69]">① えほんをとる</p>
            <p className="text-sm text-[#6B5B95]">カメラでページをパシャ！</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="text-3xl">🔍</span>
          <div>
            <p className="font-bold text-[#2D1B69]">② もじをよみとる</p>
            <p className="text-sm text-[#6B5B95]">AIがえいごの文をみつけるよ</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="text-3xl">🔊</span>
          <div>
            <p className="font-bold text-[#2D1B69]">③ よみあげる</p>
            <p className="text-sm text-[#6B5B95]">
              きれいなえいごでよんでくれる！
            </p>
          </div>
        </div>
      </div>

      {/* はじめるボタン */}
      <Link
        href="/reader"
        className="rounded-full bg-[#FF6B6B] px-12 py-5 text-xl font-bold text-white shadow-lg transition-transform active:scale-95"
      >
        はじめる 🎉
      </Link>

      {/* フッター */}
      <p className="mt-8 text-xs text-[#6B5B95]/60">
        ※ カメラとマイクの許可が必要です
      </p>
    </div>
  );
}
