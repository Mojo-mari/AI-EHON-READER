import { test, expect } from "@playwright/test";

test("ホーム画面が表示される", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "えいご絵本リーダー" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ほんだな" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("リーダー画面：撮影UIが表示される", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/reader");
  await expect(page.getByText("ページをさつえい")).toBeVisible();
  expect(errors).toEqual([]);
});

test("画像を追加するとプレビューと「よみとる」が出る", async ({ page }) => {
  await page.goto("/reader");
  // 1x1のテスト画像をアップロード
  const buf = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  await page.setInputFiles('input[type="file"]', {
    name: "test.png", mimeType: "image/png", buffer: buf,
  });
  await expect(page.getByText("1まいのしゃしん")).toBeVisible();
  await expect(page.getByText("よみとる")).toBeVisible();
});

test("複数枚の画像を一度に追加できる", async ({ page }) => {
  await page.goto("/reader");
  const buf = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );
  await page.setInputFiles('input[type="file"]', [
    { name: "a.png", mimeType: "image/png", buffer: buf },
    { name: "b.png", mimeType: "image/png", buffer: buf },
    { name: "c.png", mimeType: "image/png", buffer: buf },
  ]);
  await expect(page.getByText("3まいのしゃしん")).toBeVisible();
  await expect(page.getByAltText("しゃしん 3")).toBeVisible();
});
