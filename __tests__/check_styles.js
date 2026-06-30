const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 726 });
  await page.goto('file:///Users/cross/Desktop/VirtualBuddyShared/Vm-IX/my-projects/nps/index.html');

  const data = await page.evaluate(() => {
    function getInfo(selector) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const comp = window.getComputedStyle(el);
      return {
        selector,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        fontSize: comp.fontSize,
        maxWidth: comp.maxWidth,
        widthCSS: comp.width,
        display: comp.display,
        whiteSpace: comp.whiteSpace,
        color: comp.color,
        backgroundColor: comp.backgroundColor,
        opacity: comp.opacity,
        visibility: comp.visibility
      };
    }
    
    return [
      getInfo('body'),
      getInfo('.hero-container'),
      getInfo('.hero-content'),
      getInfo('.hero-title'),
      getInfo('.hamburger'),
      getInfo('.hamburger span')
    ];
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
