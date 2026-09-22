import { expect, test } from '@playwright/test';

function parseRgb(rgb: string): [number, number, number] {
  const match = rgb.match(/\d+(\.\d+)?/g);
  if (!match) throw new Error(`Unexpected color format: ${rgb}`);
  return [Number(match[0]), Number(match[1]), Number(match[2])];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rl, gl, bl] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG 2.x contrast ratio, symmetric regardless of which color is lighter. */
function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

test.describe('dark mode', () => {
  test('defaults to light with no stored preference', async ({ page }) => {
    await page.goto('/');

    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(parseRgb(bg)).toEqual([250, 249, 245]); // --wall-bg light: #faf9f5
  });

  test('the toggle switches the page to dark immediately, with no reload', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('app-theme-toggle button');
    await expect(toggle).toBeVisible();

    await toggle.click();

    // No page.reload() anywhere in this test — the assertion below (Playwright's toHaveCSS
    // polls until it matches or times out) is what proves the switch is immediate, not a
    // fixed sleep standing in for one.
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(24, 23, 21)');
  });

  test('the choice survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.locator('app-theme-toggle button').click();

    await page.reload();

    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(parseRgb(bg)).toEqual([24, 23, 21]);
  });

  test('/tv follows the preference set on the wall, with no toggle of its own', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('app-theme-toggle button').click();

    await page.goto('/tv');

    await expect(page.locator('app-theme-toggle')).toHaveCount(0);

    const card = page.locator('.post-card').first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    const cardBg = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(parseRgb(cardBg)).toEqual([37, 35, 32]); // --wall-surface dark: #252320
  });

  test('dark-mode ink and accent text each meet WCAG AA contrast (>=4.5:1) on the page background', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('app-theme-toggle button').click();
    // Wait for the effect that applies the toggle to actually flush before reading computed
    // styles below — otherwise this can race and read the pre-toggle (light) colors.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    const { bg, ink, accent } = await page.evaluate(() => {
      const bodyStyle = getComputedStyle(document.body);
      const probe = document.createElement('span');
      probe.style.color = 'var(--wall-accent)';
      document.body.appendChild(probe);
      const accentColor = getComputedStyle(probe).color;
      probe.remove();
      return { bg: bodyStyle.backgroundColor, ink: bodyStyle.color, accent: accentColor };
    });

    const bgRgb = parseRgb(bg);
    expect(contrastRatio(parseRgb(ink), bgRgb)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(parseRgb(accent), bgRgb)).toBeGreaterThanOrEqual(4.5);
  });
});
