const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--allow-file-access-from-files', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(__dirname, '../index.html'), {
    waitUntil: 'networkidle0',
  });
  await page.evaluate(() => document.fonts.ready);

  const screenshotPath = path.resolve(__dirname, 'desktop_1440_verify.png');
  await page.screenshot({ path: screenshotPath });

  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        left: r.left,
      };
    };

    return {
      viewport: { width: innerWidth, height: innerHeight },
      header: rect('.header-wrapper'),
      nav: rect('.actions-menu'),
      contacts: rect('.contacts'),
      hero: rect('.hero-section'),
      content: rect('.hero-content'),
      title: rect('.hero-title'),
      description: rect('.hero-description'),
      ctas: rect('.hero-ctas'),
      avatar: rect('.hero-avatar'),
      cases: rect('#cases'),
    };
  });

  await browser.close();

  fs.writeFileSync(
    path.resolve(__dirname, 'desktop_1440_verify_metrics.json'),
    JSON.stringify(metrics, null, 2)
  );
  console.log(JSON.stringify({ screenshotPath, metrics }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
