const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch({
            args: ['--allow-file-access-from-files']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        // Go to the local index.html
        const localPath = 'file://' + path.resolve(__dirname, '../index.html');
        await page.goto(localPath, { waitUntil: 'networkidle0' });
        
        // Ensure fonts are loaded
        await page.evaluate(() => document.fonts.ready);
        
        const localScreenshotPath = path.resolve(__dirname, 'desktop_puppeteer.png');
        await page.screenshot({ path: localScreenshotPath });
        
        const html = `
        <html><body style="margin:0;padding:0;background:black;">
            <img src="desktop_puppeteer.png" style="position:absolute;top:0;left:0;opacity:0.5;width:1440px;">
            <img src="figma_desktop.png" style="position:absolute;top:0;left:0;opacity:0.5;width:1440px;mix-blend-mode:screen;">
        </body></html>
        `;
        const diffHtmlPath = path.resolve(__dirname, 'diff_desktop.html');
        fs.writeFileSync(diffHtmlPath, html);
        
        await page.goto('file://' + diffHtmlPath);
        
        const diffScreenshotPath = path.resolve(__dirname, 'diff_desktop_result.png');
        await page.screenshot({ path: diffScreenshotPath });
        
        await browser.close();
        console.log('Success');
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
})();
