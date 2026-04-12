import { test } from "@playwright/test";

test("ホーム画面のスクリーンショットを取得", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tests/screenshot-home.png", fullPage: true });
  const content = await page.content();
  console.log("PAGE TEXT:", await page.innerText("body"));
});

test("readerページのスクリーンショットを取得", async ({ page }) => {
  await page.goto("/reader");
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "tests/screenshot-reader.png", fullPage: true });
  console.log("PAGE TEXT:", await page.innerText("body"));
});
