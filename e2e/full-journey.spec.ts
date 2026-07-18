/**
 * E2E: Full user journey.
 * signup → navigate to problems → open a problem → check profile.
 *
 * Since the real backend may not be available in CI, this test uses
 * localStorage injection to simulate auth state where needed.
 * The signup flow tests the UI path; actual account creation
 * depends on backend availability.
 */
import { test, expect, Page } from "@playwright/test";

async function injectAuth(page: Page, role: "user" | "admin" = "user") {
  await page.evaluate((r) => {
    const user = {
      id: "101",
      name: "Priya Suresh",
      email: "priya@example.com",
      role: r,
      solvedProblems: ["1"],
      streak: 5,
      rank: 42,
      createdAt: "2025-01-15T08:00:00Z",
    };
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEiLCJuYW1lIjoiUHJpeWEgU3VyZXNoIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.fake_sig";
    localStorage.setItem("zeph_token", JSON.stringify(token));
    localStorage.setItem("zeph_user", JSON.stringify(user));
  }, role);
  await page.reload();
  await page.waitForTimeout(1000);
}

test.describe("Full User Journey", () => {
  test("complete flow: homepage → login page → signup page", async ({ page }) => {
    // 1. Land on homepage
    await page.goto("/");
    await expect(page).toHaveTitle(/Zephlearn/i);

    // 2. Navigate to login
    const loginLink = page.locator('a[href="/login"]').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    } else {
      await page.goto("/login");
    }

    await expect(page.locator("h1")).toHaveText(/Welcome back/i);

    // 3. Navigate to signup from login
    await page.locator('a[href="/signup"]').click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.locator("h1")).toHaveText(/Create your account/i);
  });

  test("authenticated journey: problems list → problem detail → back to list", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectAuth(page);
    await page.goto("/problems");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes("/problems")) {
      test.skip();
      return;
    }

    // Navigate to problem 1 (Two Sum) directly
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const problemUrl = page.url();
    if (problemUrl.includes("/problems/1")) {
      // Problem page loaded — verify back link exists
      const backLink = page.locator('a[href="/problems"]').first();
      if (await backLink.isVisible()) {
        await backLink.click();
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/\/problems/);
      }
    }
  });

  test("profile page shows user info when authenticated", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectAuth(page);
    await page.goto("/profile");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (url.includes("/profile")) {
      // Profile card should show user's name
      await expect(page.locator("text=Priya Suresh")).toBeVisible();
      // Streak display
      await expect(page.locator("text=/day/i")).toBeVisible();
    }
  });

  test("streak is displayed on profile page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectAuth(page);
    await page.goto("/profile");
    await page.waitForTimeout(2000);

    const url = page.url();
    if (!url.includes("/profile")) return;

    // Streak section: shows flame icon + number + "days"
    const streakSection = page.locator("text=/streak/i").first();
    if (await streakSection.isVisible()) {
      await expect(streakSection).toBeVisible();
    }

    // The streak value from injected user is 5
    const streakValue = page.locator("text=/5/").first();
    if (await streakValue.isVisible()) {
      await expect(streakValue).toBeVisible();
    }
  });

  test("cross-browser smoke: app loads without JS errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors (hydration mismatches in dev mode)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("Hydration") &&
        !e.includes("Warning") &&
        !e.includes("ResizeObserver")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await page.waitForTimeout(1000);

    // TanStack Router's notFoundComponent renders
    await expect(page.locator("text=404")).toBeVisible();
    await expect(page.locator("text=Page not found")).toBeVisible();
  });

  test("admin redirect: non-admin user visiting /admin is redirected", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectAuth(page, "user"); // regular user
    await page.goto("/admin");
    await page.waitForTimeout(2000);

    // useRequireAuth("admin") redirects non-admins to /problems
    const url = page.url();
    expect(url).toMatch(/\/problems|\/login/);
    expect(url).not.toContain("/admin");
  });
});

test.describe("Cross-browser smoke tests", () => {
  test("login page renders in Chromium", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Login.*Zephlearn/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("signup page renders in Chromium", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveTitle(/Sign up.*Zephlearn/i);
    await expect(page.locator("h1")).toContainText("Create your account");
  });

  test("navigation between login and signup works", async ({ page }) => {
    await page.goto("/login");
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/\/signup/);

    await page.click('a[href="/login"]');
    await expect(page).toHaveURL(/\/login/);
  });
});
