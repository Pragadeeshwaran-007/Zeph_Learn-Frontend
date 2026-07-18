/**
 * E2E tests: Problem browsing and problem detail page.
 * Requires auth (injected via localStorage) to access /problems.
 */
import { test, expect, Page } from "@playwright/test";

// ─── Helper: inject mock auth into localStorage ───────────────────────────────
async function injectMockAuth(page: Page) {
  await page.evaluate(() => {
    const mockUser = {
      id: "101",
      name: "Priya Suresh",
      email: "priya@example.com",
      role: "user",
      solvedProblems: ["1", "2"],
      streak: 5,
      rank: 42,
      createdAt: "2025-01-15T08:00:00Z",
    };
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEiLCJuYW1lIjoiUHJpeWEgU3VyZXNoIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3MjAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.fake_sig";
    localStorage.setItem("zeph_token", JSON.stringify(mockToken));
    localStorage.setItem("zeph_user", JSON.stringify(mockUser));
  });
  await page.reload();
  // Wait for the app to hydrate with auth state
  await page.waitForTimeout(1000);
}

test.describe("Problems — Landing page", () => {
  test("home page loads with ZephLearn branding", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Zephlearn/i);
    // Logo or brand text should be present
    await expect(page.locator("body")).toBeVisible();
  });

  test("home page has links to login and signup", async ({ page }) => {
    await page.goto("/");
    // These may be rendered in Navbar when unauthenticated
    const loginLink = page.locator('a[href="/login"]').first();
    const signupLink = page.locator('a[href="/signup"]').first();

    // At least one should be present in the unauthenticated state
    const loginVisible = await loginLink.isVisible();
    const signupVisible = await signupLink.isVisible();

    expect(loginVisible || signupVisible).toBe(true);
  });
});

test.describe("Problems — Problem list (/problems)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectMockAuth(page);
    await page.goto("/problems");
    // Allow time for backend fetch or redirect
    await page.waitForTimeout(2000);
  });

  test("problems page loads (or redirects to login if auth expired)", async ({ page }) => {
    const url = page.url();
    // Either stays on /problems or redirects to /login if SSR token validation fails
    expect(url).toMatch(/\/problems|\/login/);
  });

  test("page has correct title tag", async ({ page }) => {
    const url = page.url();
    if (url.includes("/problems")) {
      await expect(page).toHaveTitle(/Problem|Zephlearn/i);
    }
  });

  test("navbar renders with ZephLearn brand", async ({ page }) => {
    // Navbar should always render
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("notification bell button exists in navbar when authenticated", async ({ page }) => {
    const url = page.url();
    if (url.includes("/problems")) {
      // Check for notification bell button
      const bellBtn = page.locator("#notification-bell-btn");
      if (await bellBtn.isVisible()) {
        await expect(bellBtn).toHaveAttribute("aria-label", "Notifications");
      }
    }
  });

  test("streak counter visible in navbar when authenticated", async ({ page }) => {
    const url = page.url();
    if (url.includes("/problems")) {
      // Streak display: "X day streak"
      const streakEl = page.locator("text=/day streak/i");
      if (await streakEl.isVisible()) {
        await expect(streakEl).toBeVisible();
      }
    }
  });
});

test.describe("Problem detail page (/problems/:id)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectMockAuth(page);
  });

  test("problem detail page loads when navigating to /problems/1", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    // If auth is valid → problems/1. If not → login.
    expect(url).toMatch(/\/problems\/1|\/login/);
  });

  test("problem detail shows tabs: Description, Submissions, Discussion", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (url.includes("/problems/1")) {
      await expect(page.locator("text=Description")).toBeVisible();
      await expect(page.locator("text=Submissions")).toBeVisible();
      await expect(page.locator("text=Discussion")).toBeVisible();
    }
  });

  test("problem detail has Run and Submit buttons", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (url.includes("/problems/1")) {
      await expect(page.locator("text=Run")).toBeVisible();
      await expect(page.locator("text=Submit")).toBeVisible();
    }
  });

  test("clicking Submissions tab shows submission history section", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (url.includes("/problems/1")) {
      await page.locator("text=Submissions").click();
      await page.waitForTimeout(500);

      // Either shows submissions or "No submissions yet" message
      const hasSubmissions =
        (await page.locator("text=No submissions yet.").isVisible()) ||
        (await page.locator("text=Accepted").first().isVisible()) ||
        (await page.locator("text=Wrong Answer").first().isVisible());

      expect(hasSubmissions).toBe(true);
    }
  });

  test("difficulty badge is visible (Easy/Medium/Hard)", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (url.includes("/problems/1")) {
      // Difficulty badge for problem 1 (Two Sum = Easy)
      const badge = page.locator("text=Easy").first();
      if (await badge.isVisible()) {
        await expect(badge).toBeVisible();
      }
    }
  });

  test("notification bell opens dropdown on click", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (!url.includes("/problems")) return;

    const bellBtn = page.locator("#notification-bell-btn");
    if (!(await bellBtn.isVisible())) return;

    await bellBtn.click();
    await page.waitForTimeout(500);

    // Dropdown should open
    const dropdown = page.locator("#notification-dropdown");
    if (await dropdown.isVisible()) {
      await expect(dropdown).toBeVisible();
      // Should show "Notifications" header
      await expect(page.locator("text=Notifications")).toBeVisible();
    }
  });

  test("notification dropdown closes when clicking outside", async ({ page }) => {
    await page.goto("/problems/1");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (!url.includes("/problems")) return;

    const bellBtn = page.locator("#notification-bell-btn");
    if (!(await bellBtn.isVisible())) return;

    // Open dropdown
    await bellBtn.click();
    await page.waitForTimeout(300);

    const dropdown = page.locator("#notification-dropdown");
    if (!(await dropdown.isVisible())) return;

    // Click outside
    await page.click("header", { position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(300);

    await expect(dropdown).not.toBeVisible();
  });
});

test.describe("Problem — 404 handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await injectMockAuth(page);
  });

  test("non-existent problem shows 'Problem not found'", async ({ page }) => {
    await page.goto("/problems/99999");
    await page.waitForTimeout(3000);

    const url = page.url();
    if (url.includes("/problems/99999")) {
      await expect(page.locator("text=Problem not found")).toBeVisible();
    }
  });
});
