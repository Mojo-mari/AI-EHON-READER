import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "利用規約 | えいご絵本リーダー",
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* 戻るリンク */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          トップへ戻る
        </Link>

        <h1 className="mb-8 text-2xl font-bold text-foreground">利用規約</h1>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="mb-3 text-base font-bold">第1条（本規約について）</h2>
            <p>
              この利用規約（以下「本規約」）は、えいご絵本リーダー（以下「本サービス」）のご利用条件を定めるものです。本サービスをご利用いただく場合は、本規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第2条（著作権について）</h2>
            <p className="mb-3">
              本サービスは、ユーザーが撮影した画像をAIで読み取り、音声として読み上げる機能を提供します。本サービスをご利用になる際は、以下の事項を遵守してください。
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>著作権を有するコンテンツ（絵本等）の利用は、ご自身が所有する書籍に限り、私的使用の目的に限定してください。</li>
              <li>図書館等からの借用物を登録した場合、返却後はアプリ内のデータを削除してください。</li>
              <li>著作権者の許可なく、読み取った内容を第三者に共有・配布することは禁止します。</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第3条（ユーザーの責任）</h2>
            <p>
              本サービスを通じて読み取り・保存するコンテンツに関する著作権その他の権利の侵害については、ユーザー自身が責任を負うものとし、当サービスは一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第4条（禁止事項）</h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>法令または本規約に違反する行為</li>
              <li>第三者の著作権・知的財産権を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第5条（免責事項）</h2>
            <p>
              本サービスは現状有姿で提供されます。AIによる読み取り・翻訳・音声生成の正確性については保証しません。本サービスの利用により生じた損害について、当サービスは責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第6条（サービスの変更・停止）</h2>
            <p>
              当サービスは、予告なく本サービスの内容を変更または停止する場合があります。これにより生じた損害について、当サービスは責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第7条（規約の改定）</h2>
            <p>
              本規約は予告なく改定される場合があります。改定後も本サービスをご利用になった場合は、改定後の規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第8条（お問い合わせ）</h2>
            <p>
              著作権侵害の申告その他のお問い合わせは、下記までご連絡ください。
              <br />
              <a
                href="mailto:contact@eigoehonjp.com"
                className="text-primary underline underline-offset-2"
              >
                contact@eigoehonjp.com
              </a>
            </p>
          </section>

          <p className="pt-4 text-xs text-muted-foreground">制定日：2026年3月23日</p>
        </div>
      </div>
    </div>
  );
}
