import { test, expect } from "@playwright/test";

test("homepage renders landing page heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Read your contract");
});

test("analyze page renders upload heading", async ({ page }) => {
  await page.goto("/analyze");
  await expect(page.locator("h1")).toHaveText("Upload your contract.");
});
