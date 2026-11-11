// מרנדר את promo.html לסרטון MP4 + תמונת פוסטר.
// דרישות: Node, Playwright (Chromium), ffmpeg.
// הרצה מתיקיית השורש של האתר:
//   python3 -m http.server 8765 &
//   node tools/promo-video/render.js          -> media/superkor-promo.mp4 (16:9, לאתר)
//   node tools/promo-video/render.js reel     -> media/superkor-reel.mp4  (9:16, לרילס/סטורי)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REEL = process.argv[2] === 'reel';
const URL = (process.env.PROMO_URL || 'http://localhost:8765/tools/promo-video/promo.html') + (REEL ? '?format=reel' : '');
const FPS = 30, DURATION = 24, W = REEL ? 1080 : 1280, H = REEL ? 1920 : 720;
const NAME = REEL ? 'superkor-reel' : 'superkor-promo';
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
        await page.screenshot({ path: path.join(frames, `f${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
        if (f % 90 === 0) console.log(`frame ${f}/${total}`);
    }
    // פוסטר: אחת מתמונות הפרויקטים (כפתור הניגון לא מסתיר טקסט)
    await page.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), 9300);
    await page.screenshot({ path: path.join(OUT, NAME + '-poster.jpg'), type: 'jpeg', quality: 86 });
    await browser.close();

    fs.mkdirSync(OUT, { recursive: true });
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%04d.jpg'),
        '-c:v', 'libx264', '-preset', 'slow', '-crf', REEL ? '23' : '24', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
        '-movflags', '+faststart', '-an', path.join(OUT, NAME + '.mp4')], { stdio: 'inherit' });
    fs.rmSync(frames, { recursive: true, force: true });
    console.log('done ->', OUT);
})();
