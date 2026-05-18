import { test, expect } from "@playwright/test";

test("homepage renders LegalPlain heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("LegalPlain");
});
