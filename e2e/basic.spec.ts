import { expect, test } from "@playwright/test";

test("direct product URL renders the full page and closes to a safe fallback", async ({ page }) => {
  await page.goto("/products/1");
  await expect(page.getByTestId("full-product")).toBeVisible();
  await expect(page.getByTestId("product-overlay")).toHaveCount(0);
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test("soft navigation opens and closes a URL-native product overlay", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: /Product 1/ }).click();
  await expect(page).toHaveURL(/\/products\/1$/);
  await expect(page.getByTestId("product-overlay")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test("nested history closes reviews before the product", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: /Product 1/ }).click();
  await page.getByRole("link", { name: /Open reviews drawer/ }).click();
  await expect(page).toHaveURL(/\/products\/1\/reviews$/);
  await expect(page.getByTestId("reviews-drawer")).toBeVisible();
  await page.getByTestId("reviews-drawer").getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(/\/products\/1$/);
  await page.getByTestId("product-overlay").getByRole("button", { name: "Close" }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test("query helpers preserve URL-native tabs", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("link", { name: /Product 1/ }).click();
  await page.getByRole("button", { name: "Reviews tab" }).click();
  await expect(page).toHaveURL(/\/products\/1\?tab=reviews$/);
  await page.reload();
  await expect(page.getByTestId("full-product")).toContainText("Active tab: reviews");
});
