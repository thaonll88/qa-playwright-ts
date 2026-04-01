// tests/ui/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/login.page";
import { TEST_ACCOUNT } from "@helpers/test-data.helper";
import { ApiHelper } from "@helpers/api.helper";
import { GetUserResponse } from "@appTypes/api.types";

test.describe.configure({ mode: "serial" }); // Run tests in this block sequentially to maintain state

test.describe("Login UI", () => {
  test("login successfully: redirect to /profile", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);

    await expect(page).toHaveURL(/.*profile/);
  });

  test("login failed: invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("invalid-username", "invalid-password");

    await expect(loginPage.errorMessage).toHaveText(
      "Invalid username or password!",
    );
  });

  test("login failed: empty credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("", "");

    await expect(loginPage.usernameInput).toHaveClass(/is-invalid/);
    await expect(loginPage.passwordInput).toHaveClass(/is-invalid/);
  });

  test("login successfully: username on profile page", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);

    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator("#userName-value")).toHaveText(
      TEST_ACCOUNT.userName,
    );
  });

  test("login successfully: profile page has books table", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);

    await expect(page).toHaveURL(/.*profile/);
    await expect(page.getByRole("table")).toBeVisible();
  });

  test("Click 'Go To Book Store' button redirects to /books", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);

    await expect(page).toHaveURL(/.*profile/);
    await page.getByRole("button", { name: "Go To Book Store" }).click();
    await expect(page).toHaveURL(/.*books/);
    await expect(page.getByRole("row").nth(1)).toBeVisible();
  });

  test("Logout: redirect to login page", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);

    await expect(page).toHaveURL(/.*profile/);
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/.*login/);
  });

  test("search book by name", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);

    await expect(page).toHaveURL(/.*profile/);
    await page.getByRole("button", { name: "Go To Book Store" }).click();
    await expect(page).toHaveURL(/.*books/);

    await page.locator("#searchBox").fill("Git");
    await expect(page.getByRole("row").nth(1)).toBeVisible();
    await expect(page.getByRole("row").nth(1)).toHaveText(/Git/);
  });

  test("select book: open book detail page correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);
    await page.getByRole("button", { name: "Go To Book Store" }).click();

    // Get text of first book
    const firstBookTitle = await page
      .getByRole("row")
      .nth(1)
      .getByRole("link")
      .textContent();

    // Click that book
    await page.getByRole("row").nth(1).getByRole("link").click();

    // Verify detail page displays the correct title
    await expect(page.locator("#title-wrapper")).toContainText(firstBookTitle!);
  });

  test("Add book to collection", async ({ page, request }) => {
    // Clean books
    const api = new ApiHelper(request);
    const tokenRes = await api.generateToken(TEST_ACCOUNT);
    const token = (await tokenRes.json()).token;
    await api.deleteAllBooks(TEST_ACCOUNT.userID, token);

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);
    await page.getByRole("button", { name: "Go To Book Store" }).click();

    // Click first book
    await page.getByRole("row").nth(1).getByRole("link").click();

    // Get book title
    const title = await page
      .getByRole("row")
      .nth(1)
      .getByRole("link")
      .textContent();

    // Handle alert
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Book added to your collection.");
      await dialog.accept();
    });

    // Add book to collection
    await page.getByText("Add To Your Collection").click();

    // Wait for dialog
    await page.waitForTimeout(1000);

    await page.goto("/profile");
    await expect(page.getByRole("table")).toContainText(title!);
  });

  test("Add book already in collection: show error", async ({
    page,
    request,
  }) => {
    // Clean books
    const api = new ApiHelper(request);
    const tokenRes = await api.generateToken(TEST_ACCOUNT);
    const token = (await tokenRes.json()).token;
    await api.deleteAllBooks(TEST_ACCOUNT.userID, token);

    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_ACCOUNT.userName, TEST_ACCOUNT.password);
    await page.getByRole("button", { name: "Go To Book Store" }).click();

    // Click first book
    await page.getByRole("row").nth(1).getByRole("link").click();

    // Add 1st time → expect success
    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.getByText("Add To Your Collection").click();
    await page.waitForTimeout(1000);

    // Add 2nd → expect error
    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain(
        "Book already present in the your collection!",
      );
      await dialog.accept();
    });
    await page.getByText("Add To Your Collection").click();
  });
});
