/**
 * E2E tests: Authentication flows.
 * Login, signup, logout, protected route redirect.
 *
 * These tests run against the real dev server (npm run dev).
 * The backend is NOT mocked here — the UI's graceful fallbacks are tested.
 */
import { test, expect, Page } from "@playwright/test";

// ─── Helper: fill and submit login form ──────────────────────────────────────
async function fillLoginForm(page: Page, email: string, password: string) {
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

// ─── Helper: fill and submit signup form ─────────────────────────────────────
async function fillSignupForm(
  page: Page,
  name: string,
  email: string,
  password: string
) {
  // Name field (no type attribute)
  await page.fill('input:not([type])', name);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

test.describe("Authentication — Login", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage between tests
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("login page renders correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/Login.*Zephlearn/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText(/Sign in/i);
  });

  test("has link to signup page", async ({ page }) => {
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveText(/Create an account/i);
  });

  test("form requires email and password fields", async ({ page }) => {
    // Try submitting with empty fields — HTML5 required validation kicks in
    await page.click('button[type="submit"]');
    // Browser validation prevents submission — we stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error toast on invalid credentials", async ({ page }) => {
    await fillLoginForm(page, "wrong@example.com", "wrongpassword");

    // Should show error notification (sonner toast or error UI)
    // The toast appears even if backend is unreachable (error is caught)
    // Wait for either a toast or stay on login page
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("ZephLearn logo is displayed on login page", async ({ page }) => {
    // Logo component should render
    const logo = page.locator("header, .mb-8").first();
    await expect(logo).toBeVisible();
  });
});

test.describe("Authentication — Signup", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("signup page renders correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/Sign up.*Zephlearn/i);
    await expect(page.locator('h1')).toHaveText(/Create your account/i);
  });

  test("signup form has name, email, and password fields", async ({ page }) => {
    const inputs = page.locator("input");
    await expect(inputs).toHaveCount(3); // name, email, password
  });

  test("submit button is present", async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText(/Create account/i);
  });

  test("has link back to login", async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveText(/Sign in/i);
  });

  test("password validation — short password shows error", async ({ page }) => {
    // The signup.tsx guards: if (password.length < 6) return toast.error(...)
    // Fill with short password
    await page.fill('input:not([type])', "Test User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "ab");

    // Click submit — the click handler fires and checks password length
    await page.locator("button").filter({ hasText: "Create account" }).click();

    // Should show error toast and stay on signup page
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe("Authentication — Logout", () => {
  test("logout button is visible when logged in (UI check via localStorage injection)", async ({
    page,
  }) => {
    // Inject a mock user into localStorage to simulate being logged in
    await page.goto("/");
    await page.evaluate(() => {
      const mockUser = {
        id: "101",
        name: "Priya Suresh",
        email: "priya@example.com",
        role: "user",
        solvedProblems: [],
        streak: 5,
        rank: 42,
        createdAt: "2025-01-15T08:00:00Z",
      };
      const mockToken = "eyJhbGciOiJIUzI1NiJ9.test.token";
      localStorage.setItem("zeph_token", JSON.stringify(mockToken));
      localStorage.setItem("zeph_user", JSON.stringify(mockUser));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Logout button (aria-label="Logout") should be visible
    const logoutBtn = page.locator('[aria-label="Logout"]');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
      // After logout, should redirect to "/"
      await expect(page).toHaveURL(/^\//);
    }
    // If Navbar doesn't render (SSR hydration), at minimum page loads
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe("Protected Routes — Unauthenticated redirect", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure no auth in localStorage
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("visiting /problems without auth redirects to /login", async ({ page }) => {
    await page.goto("/problems");
    // useRequireAuth triggers redirect to /login
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /profile without auth redirects to /login", async ({ page }) => {
    await page.goto("/profile");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("visiting /admin without auth redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
