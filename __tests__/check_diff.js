const fs = require('fs');
const { PNG } = require('pngjs');

function loadPng(filePath) {
    return new Promise((resolve) => {
        fs.createReadStream(filePath)
            .pipe(new PNG())
            .on('parsed', function() {
                resolve(this);
            });
    });
}

(async () => {
    const figma = await loadPng('figma_desktop.png');
    const local = await loadPng('desktop_puppeteer.png');
    
    // Find the bounding box of the yellow button in Figma (color #E2A028 or similar)
    // We just want to find the first pixel that is somewhat yellow in the bottom left quadrant.
    
    // Let's just crop to the CTA region: x=100..400, y=400..600
    // And print the first Y coordinate where we see non-transparent or specific color pixels.
    
    function getButtonY(image) {
        for (let y = 400; y < 600; y++) {
            for (let x = 100; x < 400; x++) {
                let idx = (image.width * y + x) << 2;
                let r = image.data[idx];
                let g = image.data[idx+1];
                let b = image.data[idx+2];
                // Button is yellow/orange: R > 200, G > 150, B < 100
                if (r > 200 && g > 130 && b < 100) {
                    return y;
                }
            }
        }
        return -1;
    }
    
    function getAvatarY(image) {
        // Avatar is around x=900..1300, y=100..600
        // Find bottom-most non-transparent pixel
        let max_y = -1;
        for (let y = 100; y < 618; y++) {
            for (let x = 900; x < 1350; x++) {
                let idx = (image.width * y + x) << 2;
                let r = image.data[idx];
                let g = image.data[idx+1];
                let b = image.data[idx+2];
                let a = image.data[idx+3];
                // Person is wearing yellow hoodie.
                if (r > 200 && g > 150 && b < 50 && a > 200) {
                    max_y = Math.max(max_y, y);
                }
            }
        }
        return max_y;
    }

    console.log("Figma Button Top Y:", getButtonY(figma));
    console.log("Local Button Top Y:", getButtonY(local));
    
    console.log("Figma Avatar Bottom Y:", getAvatarY(figma));
    console.log("Local Avatar Bottom Y:", getAvatarY(local));
})();
