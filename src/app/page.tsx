import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Camera, Search, Volume2 } from "lucide-react";
import BookshelfSection from "@/components/BookshelfSection";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      {/* タイトルエリア */}
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <BookOpen className="size-14 text-primary" />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          えいご絵本リーダー
        </h1>
        <p className="text-lg text-muted-foreground">
          えほんをカメラでとるだけ！
          <br />
          AIがきれいなえいごで
          <br />
          よみあげてくれるよ
        </p>
      </div>

      {/* 使い方の説明 */}
      <div className="mb-10 w-full max-w-sm space-y-4">
        <Link href="/reader" className="block">
          <Card className="step-card step-card-1 rounded-2xl ring-0 shadow-sm transition-transform active:scale-95">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Camera className="size-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">① えほんをとる</p>
                <p className="text-sm text-muted-foreground">カメラでページをパシャ！</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reader" className="block">
          <Card className="step-card step-card-2 rounded-2xl ring-0 shadow-sm transition-transform active:scale-95">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/10">
                <Search className="size-6 text-secondary" />
              </div>
              <div>
                <p className="font-bold text-foreground">② もじをよみとる</p>
                <p className="text-sm text-muted-foreground">AIがえいごの文をみつけるよ</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reader" className="block">
          <Card className="step-card step-card-3 rounded-2xl ring-0 shadow-sm transition-transform active:scale-95">
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <Volume2 className="size-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-foreground">③ よみあげる</p>
                <p className="text-sm text-muted-foreground">
                  きれいなえいごでよんでくれる！
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ほんだな */}
      <BookshelfSection />

      {/* はじめるボタン */}
      <Button
        render={<Link href="/reader" />}
        nativeButton={false}
        size="xl"
        className="btn-cta rounded-full border-none px-12 py-5 text-xl"
      >
        はじめる
      </Button>

      {/* フッター */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs text-muted-foreground/60">
          ※ カメラとマイクの許可が必要です
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground/50">
          <Link href="/terms" className="hover:text-muted-foreground">
            利用規約
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-muted-foreground">
            プライバシーポリシー
          </Link>
          <span>·</span>
          <a
            href="mailto:contact@eigoehonjp.com"
            className="hover:text-muted-foreground"
          >
            お問い合わせ
          </a>
        </div>
      </div>
    </div>
    </div>
  );
}
