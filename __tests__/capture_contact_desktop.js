const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 3687, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:8765/?v=footer-align-center', {
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
      contactSection: rectFor('.contact-section'),
      contactContent: rectFor('.contact-content'),
      contactLeft: rectFor('.contact-left'),
      contactRight: rectFor('.contact-right'),
      contactList: rectFor('.contact-list'),
      footerBottom: rectFor('.footer-bottom'),
      contactGlow: rectFor('.contact-glowing'),
    };
  });

  await page.screenshot({
    path: '__tests__/contact_desktop_fullpage.png',
    fullPage: true,
  });

  await require('fs/promises').writeFile(
    '__tests__/contact_desktop_metrics.json',
    JSON.stringify(metrics, null, 2)
  );

  await browser.close();
})();
