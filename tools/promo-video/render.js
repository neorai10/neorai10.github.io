// מרנדר את promo.html לסרטון MP4 + תמונת פוסטר.
// דרישות: Node, Playwright (Chromium), ffmpeg.
// הרצה מתיקיית השורש של האתר:
//   python3 -m http.server 8765 &
//   node tools/promo-video/render.js
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const URL = process.env.PROMO_URL || 'http://localhost:8765/tools/promo-video/promo.html';
const FPS = 30, DURATION = 24, W = 1280, H = 720;
const OUT = path.resolve(__dirname, '../../media');

(async () => {
    const frames = fs.mkdtempSync(path.join(os.tmpdir(), 'promo-'));
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))));

    const total = FPS * DURATION;
    for (let f = 0; f < total; f++) {
        // עוצרים את כל האנימציות ומזיזים אותן ידנית לזמן של הפריים
        await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), (f / FPS) * 1000);
        await page.screenshot({ path: path.join(frames, `f${String(f).padStart(4, '0')}.png`) });
        if (f % 90 === 0) console.log(`frame ${f}/${total}`);
    }
    // פוסטר: אחת מתמונות הפרויקטים (כפתור הניגון לא מסתיר טקסט)
    await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), 9300);
    await page.screenshot({ path: path.join(OUT, 'superkor-promo-poster.jpg'), type: 'jpeg', quality: 86 });
    await browser.close();

    fs.mkdirSync(OUT, { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.png'),
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
        '-movflags', '+faststart', '-an', path.join(OUT, 'superkor-promo.mp4')], { stdio: 'inherit' });
    fs.rmSync(frames, { recursive: true, force: true });
    console.log('done ->', OUT);
})();
