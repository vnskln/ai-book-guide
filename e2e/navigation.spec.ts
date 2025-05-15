import { test, expect } from "@playwright/test";

test("navigation works correctly", async ({ page }) => {
  // Start from the home page
  await page.goto("/");
  await expect(page).toHaveTitle(/AI Book Guide/);

  // Check if the main navigation elements are visible
  await expect(page.getByRole("navigation")).toBeVisible();

  // Test navigation to different pages
  await page.getByRole("link", { name: /about/i }).click();
  await expect(page).toHaveURL(/.*about/);

  // Verify content on the about page
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
