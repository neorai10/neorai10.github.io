// home.js - כל הלוגיקה של דף הבית (נטען עם defer)
(function () {
    'use strict';

    var WHATSAPP = '972522613282';
    var root = document.documentElement;
    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var motionOff = function () { return reduceMotion.matches || root.classList.contains('no-motion'); };

    function store(key, value) {
        try {
            if (value === undefined) return localStorage.getItem(key);
            if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
        } catch (e) { /* מצב גלישה פרטית */ }
        return null;
    }

    function track(event, data) {
        window.dataLayer = window.dataLayer || [];
        var payload = { event: event };
        for (var k in data) payload[k] = data[k];
        window.dataLayer.push(payload);
    }

    /* ---------- ניווט ---------- */
    function initNav() {
        var header = $('.site-header');
        var toggle = $('.nav-toggle');
        var links = $('#navLinks');
        if (!header || !toggle || !links) return;

        function setOpen(open) {
            links.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'סגור תפריט' : 'פתח תפריט');
        }
        toggle.addEventListener('click', function () { setOpen(!links.classList.contains('is-open')); });
        links.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && links.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
        });
        document.addEventListener('click', function (e) {
            if (links.classList.contains('is-open') && !header.contains(e.target)) setOpen(false);
        });

        // סימון הקישור הפעיל לפי הסקציה שמוצגת
        var navAnchors = $$('a[href^="#"]', links);
        if ('IntersectionObserver' in window) {
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    navAnchors.forEach(function (a) {
                        a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
                    });
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            $$('main section[id]').forEach(function (s) { spy.observe(s); });
        }
    }

    /* ---------- גלילה: פס התקדמות + הדר ---------- */
    function initScroll() {
        var header = $('.site-header');
        var ticking = false;
        function update() {
            var max = root.scrollHeight - window.innerHeight;
            root.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
            if (header) header.classList.toggle('is-stuck', window.scrollY > 60);
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }

    /* ---------- הופעה בגלילה + מונים ---------- */
    function initReveal() {
        var items = $$('.reveal');
        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        // השהיה מדורגת בין אחים באותה שורה
        items.forEach(function (el) {
            var siblings = $$(':scope > .reveal', el.parentElement);
            var idx = siblings.indexOf(el);
            if (idx > 0) el.style.setProperty('--d', Math.min(idx, 5) * 90 + 'ms');
        });
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el) { io.observe(el); });
    }

    function initCounters() {
        var counters = $$('[data-count]');
        if (!counters.length || !('IntersectionObserver' in window)) return;
        var fmt = new Intl.NumberFormat('en-US');
        function run(el) {
            var target = parseInt(el.getAttribute('data-count'), 10);
            if (motionOff()) { el.textContent = fmt.format(target); return; }
            var start = performance.now(), dur = 1600;
            (function frame(now) {
                var p = Math.min((now - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = fmt.format(Math.round(target * eased));
                if (p < 1) requestAnimationFrame(frame);
            })(start);
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
            });
        }, { threshold: 0.6 });
        counters.forEach(function (el) { io.observe(el); });
    }

    /* ---------- שלג ב-Hero ---------- */
    function initSnow() {
        var canvas = $('.hero-snow');
        var hero = $('.hero');
        if (!canvas || !hero || !canvas.getContext) return;
        var ctx = canvas.getContext('2d');
        var flakes = [], w = 0, h = 0, raf = 0, visible = true;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            w = hero.clientWidth; h = hero.clientHeight;
            canvas.width = w * dpr; canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            var count = Math.round(Math.min(90, w / 14));
            flakes = [];
            for (var i = 0; i < count; i++) {
                flakes.push({
                    x: Math.random() * w, y: Math.random() * h,
                    r: Math.random() * 2.2 + 0.6,
                    vy: Math.random() * 0.5 + 0.2,
                    vx: Math.random() * 0.4 - 0.2,
                    phase: Math.random() * Math.PI * 2,
                    a: Math.random() * 0.5 + 0.2
                });
            }
        }
        function draw() {
            ctx.clearRect(0, 0, w, h);
            for (var i = 0; i < flakes.length; i++) {
                var f = flakes[i];
                f.phase += 0.01;
                f.y += f.vy;
                f.x += f.vx + Math.sin(f.phase) * 0.25;
                if (f.y > h + 4) { f.y = -4; f.x = Math.random() * w; }
                if (f.x > w + 4) f.x = -4; else if (f.x < -4) f.x = w + 4;
                ctx.globalAlpha = f.a;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = '#cdefff';
                ctx.fill();
            }
            raf = requestAnimationFrame(draw);
        }
        function sync() {
            cancelAnimationFrame(raf);
            if (visible && !document.hidden && !motionOff()) raf = requestAnimationFrame(draw);
            else if (motionOff()) ctx.clearRect(0, 0, w, h);
        }
        resize();
        var resizeTimer;
        window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
        document.addEventListener('visibilitychange', sync);
        document.addEventListener('a11y:change', sync);
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(hero);
        }
        sync();
    }

    /* ---------- אפקט זרקור בכרטיסים + מרקיזה ---------- */
    function initCards() {
        $$('.service-card').forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                card.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
        var track = $('.marquee-track');
        if (track) {
            var clone = track.innerHTML;
            track.insertAdjacentHTML('beforeend', '<span class="marquee-dup" aria-hidden="true" style="display:contents">' + clone + '</span>');
        }
    }

    /* ---------- טופס יצירת קשר ---------- */
    function initForm() {
        var form = $('#mainContactForm');
        if (!form) return;
        var status = $('.form-status', form);
        var button = $('button[type="submit"]', form);
        var buttonText = button.textContent;

        function normalizePhone(value) {
            var digits = value.replace(/[^\d+]/g, '');
            if (digits.indexOf('+972') === 0) digits = '0' + digits.slice(4);
            else if (digits.indexOf('972') === 0) digits = '0' + digits.slice(3);
            return digits.replace(/\D/g, '');
        }
        function errorFor(input) {
            var value = input.value.trim();
            if (input.required && !value) return 'שדה זה הינו שדה חובה';
            if (!value) return '';
            if (input.name === 'name' && value.length < 2) return 'נא להזין שם מלא (לפחות 2 תווים)';
            if (input.type === 'tel' && !/^0\d{8,9}$/.test(normalizePhone(value))) return 'נא להזין מספר טלפון תקין (9-10 ספרות)';
            if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'נא להזין כתובת אימייל תקינה';
            return '';
        }
        function check(input) {
            var group = input.closest('.form-group');
            var box = group && $('.form-error', group);
            if (!box) return true;
            var message = errorFor(input);
            group.classList.toggle('error', !!message);
            box.textContent = message;
            input.setAttribute('aria-invalid', message ? 'true' : 'false');
            return !message;
        }
        function setStatus(type, message) {
            status.className = 'form-status' + (type ? ' ' + type : '');
            status.textContent = message || '';
        }

        var fields = $$('input:not([type="hidden"]):not(.hp), textarea', form);
        fields.forEach(function (input) {
            input.addEventListener('blur', function () { if (input.value) check(input); });
            input.addEventListener('input', function () {
                if (input.closest('.form-group').classList.contains('error')) check(input);
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var firstInvalid = null;
            fields.forEach(function (input) { if (!check(input) && !firstInvalid) firstInvalid = input; });
            if (firstInvalid) { firstInvalid.focus(); return; }

            var data = new FormData(form);
            data.set('phone', normalizePhone(form.phone.value));
            if (!form.email.value.trim()) data.delete('email');

            button.disabled = true;
            button.textContent = 'שולח...';
            setStatus('', '');

            fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    form.reset();
                    setStatus('success', 'הטופס נשלח בהצלחה! נציג שלנו יחזור אליך בהקדם.');
                    track('generate_lead', { form_id: 'mainContactForm' });
                })
                .catch(function () {
                    setStatus('error', 'אירעה שגיאה בשליחת הטופס. אנא נסו שוב או חייגו 052-2613282.');
                })
                .then(function () {
                    button.disabled = false;
                    button.textContent = buttonText;
                });
        });

        // קישורי "לפרטים נוספים" ממלאים מראש את ההודעה
        $$('[data-package]').forEach(function (link) {
            link.addEventListener('click', function () {
                var message = form.message;
                if (message && !message.value.trim()) message.value = 'מתעניין/ת ב: ' + link.getAttribute('data-package');
            });
        });
        // מיקוד בשדה הראשון כשמגיעים לטופס מקישור
        $$('a[href="#contact"]').forEach(function (link) {
            link.addEventListener('click', function () {
                setTimeout(function () { form.name.focus({ preventScroll: true }); }, 700);
            });
        });
    }

    /* ---------- מחשבון BTU ---------- */
    function initCalculator() {
        var form = $('#btuCalc');
        if (!form) return;
        var area = $('#calcArea'), areaOut = $('#calcAreaOut');
        var top = $('#calcTop'), peopleOut = $('#calcPeople');
        var btuOut = $('#calcBtu'), hpOut = $('#calcHp'), meter = $('#calcMeter'), note = $('#calcNote');
        var wa = $('#calcWhatsapp');
        var people = 2, shown = 12000, raf = 0;
        var fmt = new Intl.NumberFormat('en-US');
        var SIZES = [
            { btu: 9000, label: 'מזגן 1 כ"ס' },
            { btu: 12000, label: 'מזגן 1-1.5 כ"ס' },
            { btu: 18000, label: 'מזגן 1.5-2 כ"ס' },
            { btu: 24000, label: 'מזגן 2-2.5 כ"ס' },
            { btu: 30000, label: 'מזגן 2.5-3 כ"ס' },
            { btu: 36000, label: 'מזגן 4 כ"ס / מיני מרכזי' },
            { btu: 48000, label: 'מיני מרכזי' }
        ];
        var NOTE_DEFAULT = note.textContent;

        function radio(name) { return parseFloat($('input[name="' + name + '"]:checked', form).value); }
        function radioLabel(name) { return $('input[name="' + name + '"]:checked', form).nextElementSibling.textContent; }

        function animate(to) {
            cancelAnimationFrame(raf);
            if (motionOff()) { shown = to; btuOut.textContent = fmt.format(to); return; }
            var from = shown, start = performance.now();
            (function frame(now) {
                var p = Math.min((now - start) / 450, 1);
                shown = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
                btuOut.textContent = fmt.format(shown);
                if (p < 1) raf = requestAnimationFrame(frame);
            })(start);
        }

        function calc() {
            var m2 = parseInt(area.value, 10);
            // בסיס: כ-600 BTU למ"ר (כמו במדריך בבלוג), עם התאמות לתנאי החדר
            var raw = m2 * 600 * radio('calcRoom') * radio('calcSun') * (top.checked ? 1.15 : 1);
            raw += Math.max(0, people - 2) * 500;
            var size = SIZES[SIZES.length - 1], big = raw > size.btu;
            for (var i = 0; i < SIZES.length; i++) { if (raw <= SIZES[i].btu) { size = SIZES[i]; break; } }

            areaOut.textContent = m2 + ' מ"ר';
            peopleOut.textContent = people;
            hpOut.textContent = big ? 'מיני מרכזי / מספר יחידות' : size.label;
            note.textContent = big
                ? 'לחלל בגודל כזה מומלץ מיני מרכזי או כמה יחידות - נשמח לייעץ בביקור חינם.'
                : NOTE_DEFAULT;
            meter.style.width = Math.min(100, Math.round(raw / 48000 * 100)) + '%';
            animate(big ? Math.ceil(raw / 1000) * 1000 : size.btu);

            var text = 'היי סופר קור, השתמשתי במחשבון באתר:\n' +
                '• שטח: ' + m2 + ' מ"ר (' + radioLabel('calcRoom') + ')\n' +
                '• שמש: ' + radioLabel('calcSun') + (top.checked ? ', קומה עליונה' : '') + '\n' +
                '• אנשים בחדר: ' + people + '\n' +
                '• המלצה: כ-' + fmt.format(big ? Math.ceil(raw / 1000) * 1000 : size.btu) + ' BTU\n' +
                'אשמח לקבל הצעת מחיר.';
            wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
        }

        form.addEventListener('input', calc);
        $$('.stepper button', form).forEach(function (btn) {
            btn.addEventListener('click', function () {
                people = Math.max(1, Math.min(12, people + parseInt(btn.getAttribute('data-step'), 10)));
                calc();
            });
        });
        wa.addEventListener('click', function () { track('calculator_whatsapp', { btu: shown }); });
        calc();
    }

    /* ---------- גלריה: סינון + לייטבוקס ---------- */
    function initGallery() {
        var grid = $('.works-grid');
        var box = $('#lightbox');
        if (!grid || !box) return;
        var cards = $$('.work-card', grid);
        var chips = $$('.chip[data-filter]');
        var img = $('#lbImage'), caption = $('#lbCaption'), count = $('#lbCount');
        var visible = cards.slice(), index = 0, lastFocus = null;

        function filter(cat) {
            visible = [];
            cards.forEach(function (card) {
                var show = cat === 'all' || card.getAttribute('data-cat') === cat;
                card.classList.toggle('is-hidden', !show);
                if (show) visible.push(card);
            });
            grid.classList.toggle('is-filtered', cat !== 'all');
            chips.forEach(function (chip) {
                var active = chip.getAttribute('data-filter') === cat;
                chip.classList.toggle('is-active', active);
                chip.setAttribute('aria-pressed', String(active));
            });
        }
        chips.forEach(function (chip) {
            chip.addEventListener('click', function () { filter(chip.getAttribute('data-filter')); });
        });
        $$('[data-filter-link]').forEach(function (link) {
            link.addEventListener('click', function () { filter(link.getAttribute('data-filter-link')); });
        });

        function show(i) {
            index = (i + visible.length) % visible.length;
            var card = visible[index];
            var title = $('strong', card).textContent;
            var place = $('.work-info span', card).textContent;
            img.src = card.getAttribute('data-full');
            img.alt = $('img', card).alt;
            caption.textContent = title + ' - ' + place;
            count.textContent = (index + 1) + ' / ' + visible.length;
            // טעינה מוקדמת של התמונה הבאה
            var next = visible[(index + 1) % visible.length];
            if (next) { new Image().src = next.getAttribute('data-full'); }
        }
        function open(card) {
            lastFocus = card;
            box.hidden = false;
            document.body.style.overflow = 'hidden';
            show(visible.indexOf(card));
            $('.lb-close', box).focus();
        }
        function close() {
            box.hidden = true;
            document.body.style.overflow = '';
            img.removeAttribute('src');
            if (lastFocus) lastFocus.focus();
        }

        cards.forEach(function (card) { card.addEventListener('click', function () { open(card); }); });
        $('.lb-close', box).addEventListener('click', close);
        $('.lb-next', box).addEventListener('click', function () { show(index + 1); });
        $('.lb-prev', box).addEventListener('click', function () { show(index - 1); });
        box.addEventListener('click', function (e) { if (e.target === box || e.target.tagName === 'FIGURE') close(); });

        document.addEventListener('keydown', function (e) {
            if (box.hidden) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') show(index + 1);   // RTL: שמאלה = הבא
            else if (e.key === 'ArrowRight') show(index - 1);
            else if (e.key === 'Tab') {
                var focusables = $$('button', box);
                var first = focusables[0], last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });

        // החלקה במובייל
        var startX = null;
        box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
        box.addEventListener('touchend', function (e) {
            if (startX === null) return;
            var dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) show(index + (dx > 0 ? 1 : -1));
            startX = null;
        });
    }

    /* ---------- סרטון ---------- */
    function initVideo() {
        var video = $('#promoVideo');
        var play = $('#videoPlay');
        if (!video || !play) return;
        var frame = video.closest('.video-frame');
        video.controls = false;
        play.addEventListener('click', function () {
            video.controls = true;
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
        });
        video.addEventListener('play', function () {
            frame.classList.add('is-playing');
            if (!video.dataset.tracked) { video.dataset.tracked = '1'; track('video_play', { video: 'promo' }); }
        });
        video.addEventListener('ended', function () {
            frame.classList.remove('is-playing');
            video.controls = false;
        });
    }

    /* ---------- שעות פעילות: פתוח עכשיו? ---------- */
    function initOpenNow() {
        var el = $('#openNow');
        if (!el) return;
        try {
            var parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
            }).formatToParts(new Date());
            var get = function (type) { return parts.filter(function (p) { return p.type === type; })[0].value; };
            var day = get('weekday'), mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);
            var open = false;
            if (['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].indexOf(day) > -1) open = mins >= 480 && mins < 1140;
            else if (day === 'Fri') open = mins >= 480 && mins < 780;
            el.textContent = open ? 'פתוח עכשיו' : 'סגור כרגע - אפשר להשאיר פרטים ונחזור אליכם';
            el.classList.toggle('is-open', open);
            el.hidden = false;
        } catch (e) { /* דפדפן ישן - לא מציגים */ }
    }

    /* ---------- עוגיות ---------- */
    function initCookies() {
        var banner = $('#cookieConsentBanner');
        if (!banner) return;
        if (!store('cookieConsent')) banner.hidden = false;
        function choose(value) {
            store('cookieConsent', value);
            banner.hidden = true;
            if (value === 'all' && typeof window.gtag === 'function') {
                window.gtag('consent', 'update', {
                    analytics_storage: 'granted', ad_storage: 'granted',
                    ad_user_data: 'granted', ad_personalization: 'granted'
                });
            }
        }
        $('#cookieAcceptAll').addEventListener('click', function () { choose('all'); });
        $('#cookieAcceptEssential').addEventListener('click', function () { choose('essential'); });
    }

    /* ---------- נגישות ---------- */
    function initAccessibility() {
        var btn = $('.accessibility-btn');
        var menu = $('#a11yMenu');
        if (!btn || !menu) return;
        var toggles = $$('[data-a11y]', menu);
        var saved = {};
        try { saved = JSON.parse(store('a11ySettings') || '{}') || {}; } catch (e) { saved = {}; }

        function apply(name, on) {
            root.classList.toggle(name, on);
            var b = $('[data-a11y="' + name + '"]', menu);
            if (b) { b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'כבה' : 'הפעל'; }
            if (name === 'no-motion') document.dispatchEvent(new Event('a11y:change'));
        }
        toggles.forEach(function (b) {
            var name = b.getAttribute('data-a11y');
            if (saved[name]) apply(name, true);
            b.addEventListener('click', function () {
                saved[name] = !root.classList.contains(name);
                apply(name, saved[name]);
                store('a11ySettings', JSON.stringify(saved));
            });
        });
        $('#resetAccessibility').addEventListener('click', function () {
            toggles.forEach(function (b) { apply(b.getAttribute('data-a11y'), false); });
            saved = {};
            store('a11ySettings', null);
        });

        function setOpen(open) {
            menu.hidden = !open;
            btn.setAttribute('aria-expanded', String(open));
        }
        btn.addEventListener('click', function () { setOpen(menu.hidden); });
        document.addEventListener('click', function (e) {
            if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) setOpen(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
        });
    }

    /* ---------- מעקב המרות ---------- */
    function initTracking() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('a');
            if (!link) return;
            var href = link.getAttribute('href') || '';
            var section = link.closest('section[id], footer, header, nav');
            var where = section ? (section.id || section.className.split(' ')[0]) : 'unknown';
            if (href.indexOf('tel:') === 0) {
                track('phone_call', { phone_number: href.replace('tel:', ''), phone_call_location: where });
            } else if (href.indexOf('wa.me') > -1) {
                track('whatsapp_click', { click_location: where });
            }
        });
    }

    function init() {
        var year = $('#year');
        if (year) year.textContent = new Date().getFullYear();
        [initNav, initScroll, initReveal, initCounters, initSnow, initCards, initForm, initCalculator,
            initGallery, initVideo, initOpenNow, initCookies, initAccessibility, initTracking
        ].forEach(function (fn) {
            try { fn(); } catch (err) { if (window.console) console.error(err); }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
