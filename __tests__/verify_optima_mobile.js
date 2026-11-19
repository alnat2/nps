const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: true,
            args: ['--allow-file-access-from-files', '--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 360, height: 800, deviceScaleFactor: 1 });
        
        const localPath = 'file://' + path.resolve(__dirname, '../optima.html');
        await page.goto(localPath, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        
        const hero = await page.$('.scase-hero-section');
        if (hero) {
            await hero.screenshot({ path: path.resolve(__dirname, 'optima_mobile_hero.png') });
        }

        const highlighters = await page.$('.optima-highlighters');
        if (highlighters) {
            await highlighters.screenshot({ path: path.resolve(__dirname, 'optima_mobile_highlighters.png') });
        }

        const kpi = await page.$('.kpi-section');
        if (kpi) {
            await kpi.screenshot({ path: path.resolve(__dirname, 'optima_mobile_kpi.png') });
        }

        const chapters = await page.$$('.case-chapter');
        for (let i = 0; i < chapters.length; i++) {
            await chapters[i].screenshot({ path: path.resolve(__dirname, `optima_mobile_chapter_${i+1}.png`) });
        }

        const footer = await page.$('.contact-section');
        if (footer) {
            await footer.screenshot({ path: path.resolve(__dirname, 'optima_mobile_footer.png') });
        }

        // Test mobile menu open state (openmenu frame in Figma)
        const hamburger = await page.$('.hamburger');
        if (hamburger) {
            await hamburger.click();
            await new Promise(r => setTimeout(r, 400)); // wait for transition
            await page.screenshot({ path: path.resolve(__dirname, 'optima_mobile_openmenu.png'), clip: { x: 0, y: 0, width: 360, height: 655 } });
        }

        console.log('Mobile screenshots complete!');
        await browser.close();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
