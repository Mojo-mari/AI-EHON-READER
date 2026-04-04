import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "プライバシーポリシー | えいご絵本リーダー",
};

export default function PrivacyPage() {
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

        <h1 className="mb-8 text-2xl font-bold text-foreground">
          プライバシーポリシー
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="mb-3 text-base font-bold">収集する情報</h2>
            <p className="mb-3">本サービスが収集・利用する情報は以下の通りです。</p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <span className="font-bold text-foreground">撮影した画像</span>
                ：絵本の読み取りのためにAI（OpenAI）に送信されます。送信後は保持されません。
              </li>
              <li>
                <span className="font-bold text-foreground">読み取ったテキスト</span>
                ：お使いの端末内（ブラウザのローカルストレージ）にのみ保存されます。当サービスのサーバーには送信・保存されません。
              </li>
              <li>
                <span className="font-bold text-foreground">音声データ</span>
                ：生成された音声はAI（OpenAI）によって作成されます。音声データはサーバーに保存されません。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">個人情報の収集について</h2>
            <p>
              本サービスは、氏名・メールアドレス・電話番号などの個人情報を収集しません。ログイン機能・アカウント登録機能は現時点では提供していません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">第三者サービスの利用</h2>
            <p className="mb-3">
              本サービスは画像の読み取り・翻訳・音声生成のためにOpenAI APIを利用しています。撮影した画像・テキストはOpenAIのサーバーに送信されます。OpenAIのプライバシーポリシーについては
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                こちら
              </a>
              をご確認ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">データの保存場所</h2>
            <p>
              本サービスで保存される本棚データ（本のタイトル・テキスト）は、すべてお使いの端末のブラウザ内にのみ保存されます。当サービスのサーバーには一切送信されません。ブラウザのデータを削除した場合、保存データも削除されます。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">Cookieについて</h2>
            <p>
              本サービスは現時点でCookieを使用していません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">プライバシーポリシーの改定</h2>
            <p>
              本ポリシーは予告なく改定される場合があります。改定後も本サービスをご利用になった場合は、改定後のポリシーに同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-bold">お問い合わせ</h2>
            <p>
              プライバシーに関するお問い合わせは下記までご連絡ください。
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
