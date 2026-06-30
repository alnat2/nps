const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 2709, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8765/?v=jobs-desktop', {
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
      jobsSection: rectFor('.jobs-section'),
      sectionHeader: rectFor('.jobs-section .section-header'),
      timeline: rectFor('.timeline'),
      firstCard: rectFor('.job-card:nth-child(1)'),
      secondCard: rectFor('.job-card:nth-child(2)'),
      thirdCard: rectFor('.job-card:nth-child(3)'),
      firstDate: rectFor('.job-card:nth-child(1) .job-date'),
      firstLine: rectFor('.job-card:nth-child(1) .timeline-line'),
      firstContent: rectFor('.job-card:nth-child(1) .job-content'),
      firstTag: rectFor('.job-card:nth-child(1) .tag'),
      firstTitle: rectFor('.job-card:nth-child(1) h3'),
      firstDesc: rectFor('.job-card:nth-child(1) .job-desc'),
    };
  });

  await page.screenshot({
    path: '__tests__/jobs_desktop_fullpage.png',
    fullPage: true,
  });

  await require('fs/promises').writeFile(
    '__tests__/jobs_desktop_metrics.json',
    JSON.stringify(metrics, null, 2)
  );

  await browser.close();
})();
