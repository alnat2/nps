const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--allow-file-access-from-files', '--no-sandbox'],
  });

  const page = await browser.newPage();
  const filePath = 'file://' + path.resolve(__dirname, '../works.html');

  // 1. Desktop 1440
  await page.setViewport({ width: 1440, height: 1800, deviceScaleFactor: 1 });
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const desktopSection = await page.$('.works-cases-section');
  await desktopSection.screenshot({ path: path.resolve(__dirname, 'works_cases_desktop.png') });

  const desktopMetrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.works-cases-grid .case-card'));
    return {
      cardCount: cards.length,
      cards: cards.map(c => {
        const r = c.getBoundingClientRect();
        const title = c.querySelector('h3') ? c.querySelector('h3').innerText.trim() : '';
        const desc = c.querySelector('p') ? c.querySelector('p').innerText.trim() : '';
        const tags = Array.from(c.querySelectorAll('.tag')).map(t => t.innerText.trim());
        const link = c.querySelector('.case-btn') ? c.querySelector('.case-btn').getAttribute('href') : '';
        const desktopImg = c.querySelector('.case-bg-desktop');
        const mobileImg = c.querySelector('.case-bg-mobile');
        return {
          rect: { width: r.width, height: r.height, x: r.x, y: r.y },
          title,
          desc,
          tags,
          link,
          desktopImg: desktopImg ? {
            src: desktopImg.src.split('/').pop(),
            displayed: window.getComputedStyle(desktopImg).display !== 'none',
            naturalWidth: desktopImg.naturalWidth,
            naturalHeight: desktopImg.naturalHeight
          } : null,
          mobileImg: mobileImg ? {
            src: mobileImg.src.split('/').pop(),
            displayed: window.getComputedStyle(mobileImg).display !== 'none'
          } : null
        };
      })
    };
  });

  // 2. Tablet 800
  await page.setViewport({ width: 800, height: 2000, deviceScaleFactor: 1 });
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const tabletSection = await page.$('.works-cases-section');
  await tabletSection.screenshot({ path: path.resolve(__dirname, 'works_cases_tablet.png') });

  const tabletMetrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.works-cases-grid .case-card'));
    return {
      cards: cards.map(c => {
        const r = c.getBoundingClientRect();
        const desktopImg = c.querySelector('.case-bg-desktop');
        const mobileImg = c.querySelector('.case-bg-mobile');
        return {
          rect: { width: r.width, height: r.height },
          desktopImgDisplayed: desktopImg ? window.getComputedStyle(desktopImg).display !== 'none' : false,
          mobileImgDisplayed: mobileImg ? window.getComputedStyle(mobileImg).display !== 'none' : false,
          mobileImgSrc: mobileImg ? mobileImg.src.split('/').pop() : ''
        };
      })
    };
  });

  // 3. Mobile 360
  await page.setViewport({ width: 360, height: 2600, deviceScaleFactor: 1 });
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);

  const mobileSection = await page.$('.works-cases-section');
  await mobileSection.screenshot({ path: path.resolve(__dirname, 'works_cases_mobile.png') });

  const mobileMetrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.works-cases-grid .case-card'));
    return {
      cards: cards.map(c => {
        const r = c.getBoundingClientRect();
        const desktopImg = c.querySelector('.case-bg-desktop');
        const mobileImg = c.querySelector('.case-bg-mobile');
        return {
          rect: { width: r.width, height: r.height },
          desktopImgDisplayed: desktopImg ? window.getComputedStyle(desktopImg).display !== 'none' : false,
          mobileImgDisplayed: mobileImg ? window.getComputedStyle(mobileImg).display !== 'none' : false,
          mobileImgSrc: mobileImg ? mobileImg.src.split('/').pop() : ''
        };
      })
    };
  });

  await browser.close();

  console.log(JSON.stringify({ desktopMetrics, tabletMetrics, mobileMetrics }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
