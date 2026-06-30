const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1332, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8765/?v=cases-desktop', {
    waitUntil: 'networkidle0',
  });

  const metrics = await page.evaluate(() => {
    const rectFor = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    };

    return {
      body: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      },
      caseSection: rectFor('.case-section'),
      sectionHeader: rectFor('.case-section .section-header'),
      sectionTitle: rectFor('.case-section .section-title'),
      sectionLink: rectFor('.case-section .section-link'),
      casesGrid: rectFor('.cases-grid'),
      firstCard: rectFor('.case-card:not(.card-small)'),
      secondCard: rectFor('.case-card.card-small'),
      firstTags: rectFor('.case-card:not(.card-small) .tags'),
      secondTags: rectFor('.case-card.card-small .tags'),
      firstButton: rectFor('.case-card:not(.card-small) .case-btn'),
      secondButton: rectFor('.case-card.card-small .case-btn'),
    };
  });

  await page.screenshot({
    path: '__tests__/cases_desktop_fullpage.png',
    fullPage: true,
  });

  await require('fs/promises').writeFile(
    '__tests__/cases_desktop_metrics.json',
    JSON.stringify(metrics, null, 2)
  );

  await browser.close();
})();
