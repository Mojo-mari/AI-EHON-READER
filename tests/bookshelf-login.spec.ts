import { test, expect } from "@playwright/test";

test.describe("未ログイン時の本棚ログイン促進", () => {
  test("ホーム画面の本棚エリアにログイン促進ボタンが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /ログインするとほんだなが使えるよ/ })
    ).toBeVisible();
  });

  test("ホーム画面に通常の本棚リストが表示されない", async ({ page }) => {
    await page.goto("/");
    // 本棚の本リストは表示されないこと
    await expect(page.locator("text=まだ保存された本はありません")).not.toBeVisible();
  });

  test("ホーム画面のログイン促進ボタンをクリックするとGoogle認証に遷移する", async ({ page }) => {
    await page.goto("/");
    const loginButton = page.getByRole("button", { name: /ログインするとほんだなが使えるよ/ });
    await loginButton.click();
    // Googleログイン or Supabaseのリダイレクトが始まることを確認
    await expect(page).toHaveURL(/accounts\.google\.com|supabase/, { timeout: 5000 });
  });

  test("readerページが正常に表示される", async ({ page }) => {
    await page.goto("/reader");
    // カメラ撮影画面が表示されること
    await expect(page.locator("text=ページをさつえい")).toBeVisible({ timeout: 5000 });
  });
});
