import { test, expect } from "@playwright/test";
import site from "../../content/site.json" with { type: "json" };
const archive = `http://127.0.0.1:4322${site.basePath}`;

test("all 2026 pages have readable content without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [path, heading] of [
    ["", "Java Developers' Conference 2026"],
    ["sessions.html", "Sessions"],
    ["schedule/", "Schedule"],
  ]) {
    await page.goto(`http://127.0.0.1:4321${site.basePath}${path}`);
    await expect(page.locator("h1")).toHaveText(heading);
    await expect(page.locator("main")).not.toContainText("loading payload");
    await expect(page.locator(".themebtn:visible")).toHaveCount(0);
  }
  await context.close();
});

test("archive abstracts and speaker biographies work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${archive}sessions.html`);
  await expect(page.locator("[data-session]")).toHaveCount(8);
  const details = page.locator("#details-2025-modern-java");
  await details.locator("summary").click();
  await expect(details.locator(".prose").first()).toContainText(
    "Java has changed",
  );
  await expect(page.locator("a button")).toHaveCount(0);
  await context.close();
});

test("agenda selection survives reload and carries from sessions to schedule", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${archive}sessions.html`);
  const button = page.locator(
    '[data-session="2025-modern-java"] > .foot [data-star]',
  );
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-only-starred]").click();
  await expect(page.locator("[data-session]:visible")).toHaveCount(1);
  await page.goto(`${archive}schedule/`);
  const star = page.locator('[data-star="2025-modern-java"]');
  await expect(star).toHaveAttribute("aria-pressed", "true");
  await page.locator("[data-only-starred]").click();
  await expect(page.locator('[data-kind="session"]:visible')).toHaveCount(1);
  await star.click();
  await expect(page.locator("[data-schedule-empty]")).toBeVisible();
  expect(errors).toEqual([]);
});

test("dialogs have names, support Escape, restore focus, and accept deep links", async ({
  page,
}) => {
  await page.goto(`${archive}sessions.html`);
  const trigger = page.locator('[data-open-dialog="dialog-2025-modern-java"]');
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "From 21 to 25: What Modern Java Looks Like Today",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.goto(`${archive}sessions.html#2025-modern-java`);
  await expect(dialog).toBeVisible();
});

test("filters leave controls and their focus intact", async ({ page }) => {
  await page.goto(`${archive}sessions.html`);
  const filter = page.getByRole("button", {
    name: "Project Valhalla",
    exact: true,
  });
  await filter.click();
  await expect(filter).toBeFocused();
  await expect(page.locator("[data-session]:visible")).toHaveCount(1);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator("[data-session]:visible")).toHaveCount(8);
});

test("blocked storage preserves content, agenda, and theme interactions", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
  });
  await page.goto(`${archive}sessions.html`);
  const button = page.locator(
    '[data-session="2025-modern-java"] > .foot [data-star]',
  );
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#agenda-status")).toContainText("this visit");
  await page.locator(".themebtn:visible").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(errors).toEqual([]);
});

test("non-array saved data does not stop page initialization", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("jdc-2025:agenda:v1", "{}"),
  );
  await page.goto(`${archive}sessions.html`);
  await page
    .locator('[data-session="2025-modern-java"] > .foot [data-star]')
    .click();
  await expect(
    page.locator('[data-session="2025-modern-java"] > .foot [data-star]'),
  ).toHaveAttribute("aria-pressed", "true");
});

test("live marker follows Dhaka time for a visitor in Toronto", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2025-12-06T04:45:00Z") });
  await page.goto(`${archive}schedule/`);
  await expect(page.locator("[data-live]")).toBeVisible();
  await expect(page.locator("[data-live-time]")).toHaveText("10:45");
  await expect(page.locator("[data-slot].now")).toHaveAttribute(
    "data-session-id",
    "2025-modern-java",
  );
});

test("preview rejects invalid times and highlights a valid scheduled slot", async ({
  page,
}) => {
  await page.goto(`${archive}schedule/?now=14:10`);
  await expect(page.locator("[data-slot].now")).toHaveAttribute(
    "data-session-id",
    "2025-inside-lucene",
  );
  await page.goto(`${archive}schedule/?now=24:00`);
  await expect(page.locator("[data-live]")).toBeHidden();
});

for (const width of [320, 390, 1280]) {
  test(`pages fit a ${width}px viewport`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["", "sessions.html", "schedule/"]) {
      await page.goto(`http://127.0.0.1:4321${site.basePath}${route}`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      if (!route) {
        await page.evaluate(async () => {
          await Promise.all(
            [...document.images].map((image) => {
              image.loading = "eager";
              return image.decode();
            }),
          );
        });
        const photo = await page.locator(".gallery img").first().boundingBox();
        expect(photo.width / photo.height).toBeCloseTo(1.5, 1);
        await page.screenshot({
          path: testInfo.outputPath("home.png"),
          fullPage: true,
        });
      }
    }
    await page.goto(`${archive}sessions.html`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}
