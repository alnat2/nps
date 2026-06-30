const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 3197, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8765/?v=skills-shadow-blend', {
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
      skillsSection: rectFor('.skills-section'),
      sectionHeader: rectFor('.skills-section .section-header'),
      skillsGrid: rectFor('.skills-grid'),
      firstCard: rectFor('.skill-card:nth-child(1)'),
      secondCard: rectFor('.skill-card:nth-child(2)'),
      thirdCard: rectFor('.skill-card:nth-child(3)'),
      fourthCard: rectFor('.skill-card:nth-child(4)'),
      firstCardTitle: rectFor('.skill-card:nth-child(1) h3'),
      firstCardTags: rectFor('.skill-card:nth-child(1) .tags'),
      langRow: rectFor('.lang-row'),
    };
  });

  await page.screenshot({
    path: '__tests__/skills_desktop_fullpage.png',
    fullPage: true,
  });

  await require('fs/promises').writeFile(
    '__tests__/skills_desktop_metrics.json',
    JSON.stringify(metrics, null, 2)
  );

  await browser.close();
})();
