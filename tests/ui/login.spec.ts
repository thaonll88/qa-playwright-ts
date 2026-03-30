// tests/ui/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/login.page";
import { TEST_ACCOUNT } from "@helpers/test-data.helper";

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
});
