document.addEventListener('DOMContentLoaded', () => {
    // Live clock in navbar
    function updateClock() {
        const clock = document.getElementById('navClock');
        if (!clock) return;
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const offset = -now.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const absOffset = Math.abs(offset);
        const oh = String(Math.floor(absOffset / 60)).padStart(2, '0');
        const om = String(absOffset % 60).padStart(2, '0');
        clock.textContent = `${h}:${m}:${s} GMT${sign}${oh}:${om}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ── Mouse motion ──
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (canHover && !reduceMotion) {
        const root     = document.documentElement;
        const dot      = document.getElementById('cursorDot');
        const ring     = document.getElementById('cursorRing');
        const label    = ring.querySelector('.cursor-label');
        const hero     = document.querySelector('.hero');
        const shapes   = document.querySelectorAll('.shape');
        const heroContent = document.querySelector('.hero-content');
        const lerp     = (a, b, t) => a + (b - a) * t;

        // Smoothed pointer state
        let mx = innerWidth / 2, my = innerHeight / 2;   // raw mouse
        let rx = mx, ry = my;                            // ring (lags)
        let px = 0, py = 0;                              // parallax (-1..1, smoothed)
        let tx = 0, ty = 0;                              // parallax target

        root.classList.add('has-custom-cursor');

        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            tx = (mx / innerWidth  - 0.5) * 2;
            ty = (my / innerHeight - 0.5) * 2;
            root.classList.add('cursor-visible');
            dot.style.transform = `translate(${mx}px, ${my}px)`;
        });
        document.addEventListener('mouseleave', () => root.classList.remove('cursor-visible'));
        document.addEventListener('mouseenter', () => root.classList.add('cursor-visible'));
        window.addEventListener('mousedown', () => ring.classList.add('is-down'));
        window.addEventListener('mouseup',   () => ring.classList.remove('is-down'));

        // Hide custom cursor over the Cal.com iframe (it has its own cursor)
        const cal = document.getElementById('cal-embed');
        if (cal) {
            cal.addEventListener('mouseenter', () => root.classList.remove('cursor-visible'));
            cal.addEventListener('mouseleave', () => root.classList.add('cursor-visible'));
        }

        // Ring state: link / media
        const linkSel = 'a, button, .close-modal';
        document.addEventListener('mouseover', (e) => {
            const onCard = e.target.closest('.work-card');
            const onLink = e.target.closest(linkSel);
            ring.classList.toggle('is-media', !!onCard && !onLink);
            ring.classList.toggle('is-link',  !!onLink);
        });

        // Smooth animation loop
        (function frame() {
            rx = lerp(rx, mx, 0.16);
            ry = lerp(ry, my, 0.16);
            ring.style.transform = `translate(${rx}px, ${ry}px)`;

            px = lerp(px, tx, 0.06);
            py = lerp(py, ty, 0.06);
            shapes.forEach((s, i) => {
                const depth = (i + 1) * 55;
                s.style.translate = `${-px * depth}px ${-py * depth}px`;
            });
            // hero text floats slightly with the mouse
            heroContent.style.transform = `translate(${px * 14}px, ${py * 10}px)`;
            requestAnimationFrame(frame);
        })();

        // Hero spotlight
        hero.addEventListener('mousemove', (e) => {
            const r = hero.getBoundingClientRect();
            hero.style.setProperty('--sx', (e.clientX - r.left) + 'px');
            hero.style.setProperty('--sy', (e.clientY - r.top) + 'px');
        });

        // Work cards: 3D tilt + spotlight
        document.querySelectorAll('.work-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top)  / r.height;
                card.style.setProperty('--ry', ((x - 0.5) *  16) + 'deg');
                card.style.setProperty('--rx', ((y - 0.5) * -16) + 'deg');
                card.style.setProperty('--gx', (x * 100) + '%');
                card.style.setProperty('--gy', (y * 100) + '%');
            });
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });

        // Magnetic buttons
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                btn.style.setProperty('--mx', ((e.clientX - (r.left + r.width  / 2)) * 0.4) + 'px');
                btn.style.setProperty('--my', ((e.clientY - (r.top  + r.height / 2)) * 0.5) + 'px');
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.setProperty('--mx', '0px');
                btn.style.setProperty('--my', '0px');
            });
        });
    }

    // ── Unique motion: dot field + springy headline + RGB split ──
    if (canHover && !reduceMotion) {
        const hero  = document.querySelector('.hero');
        const h1    = hero.querySelector('h1');
        const lerp  = (a, b, t) => a + (b - a) * t;

        // Pointer (viewport coords) + speed
        let mx = -9999, my = -9999, lastX = 0, lastY = 0, speed = 0, split = 0;
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            speed = Math.min(Math.hypot(e.clientX - lastX, e.clientY - lastY), 80);
            lastX = e.clientX; lastY = e.clientY;
        });

        // 1) Split headline into letters that behave like springs
        const text = h1.textContent;
        h1.setAttribute('aria-label', text);
        h1.textContent = '';
        const chars = [];
        text.split('').forEach(ch => {
            if (ch === ' ') { h1.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch;
            s.setAttribute('aria-hidden', 'true');
            h1.appendChild(s);
            chars.push({ el: s, ox: 0, oy: 0, vx: 0, vy: 0, h: 0 });
        });

        // 2) Dot-grid canvas in hero
        const canvas = document.createElement('canvas');
        canvas.className = 'hero-dots';
        hero.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        const GAP = 34, RADIUS = 170;
        let dots = [], W = 0, H = 0, dpr = 1, ripples = [], heroVisible = true;

        function buildGrid() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            const r = hero.getBoundingClientRect();
            W = r.width; H = r.height;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            dots = [];
            for (let y = GAP / 2; y < H; y += GAP)
                for (let x = GAP / 2; x < W; x += GAP)
                    dots.push({ x, y, ox: 0, oy: 0, vx: 0, vy: 0 });
        }
        buildGrid();
        window.addEventListener('resize', buildGrid);
        new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(hero);

        hero.addEventListener('mousedown', (e) => {
            if (e.target.closest('a, button')) return;
            const r = hero.getBoundingClientRect();
            ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0 });
        });

        function frame() {
            requestAnimationFrame(frame);
            if (!heroVisible) return;

            const r = hero.getBoundingClientRect();
            const lx = mx - r.left, ly = my - r.top;

            // --- dots ---
            ctx.clearRect(0, 0, W, H);
            ripples.forEach(rp => rp.t += 1);
            ripples = ripples.filter(rp => rp.t < 70);

            for (const d of dots) {
                let fx = 0, fy = 0, glow = 0;
                const dx = d.x + d.ox - lx, dy = d.y + d.oy - ly;
                const dist = Math.hypot(dx, dy);
                if (dist < RADIUS) {
                    const f = (1 - dist / RADIUS);
                    fx += (dx / (dist || 1)) * f * 2.4;
                    fy += (dy / (dist || 1)) * f * 2.4;
                    glow = f;
                }
                for (const rp of ripples) {
                    const rdx = d.x - rp.x, rdy = d.y - rp.y;
                    const rd = Math.hypot(rdx, rdy);
                    const band = Math.abs(rd - rp.t * 12);
                    if (band < 50) {
                        const f = (1 - band / 50) * (1 - rp.t / 70) * 5;
                        fx += (rdx / (rd || 1)) * f; fy += (rdy / (rd || 1)) * f;
                        glow = Math.max(glow, (1 - band / 50) * (1 - rp.t / 70));
                    }
                }
                d.vx = (d.vx + fx - d.ox * 0.06) * 0.86;
                d.vy = (d.vy + fy - d.oy * 0.06) * 0.86;
                d.ox += d.vx; d.oy += d.vy;

                const rad = 1.1 + glow * 3.2;
                ctx.beginPath();
                ctx.arc(d.x + d.ox, d.y + d.oy, rad, 0, 6.2832);
                ctx.fillStyle = glow > 0.02
                    ? `rgba(${Math.round(144 - glow * 111)}, ${Math.round(196 - glow * 46)}, 243, ${0.22 + glow * 0.78})`
                    : 'rgba(144, 196, 237, 0.2)';
                ctx.fill();
            }

            // --- headline letters ---
            for (const c of chars) {
                const b = c.el.getBoundingClientRect();
                const cx = b.left + b.width / 2 - c.ox, cy = b.top + b.height / 2 - c.oy;
                const dx = cx - mx, dy = cy - my, dist = Math.hypot(dx, dy);
                let fx = 0, fy = 0, target = 0;
                if (dist < 150) {
                    const f = 1 - dist / 150;
                    fx = (dx / (dist || 1)) * f * 3.2;
                    fy = (dy / (dist || 1)) * f * 3.2;
                    target = f;
                }
                c.vx = (c.vx + fx - c.ox * 0.08) * 0.84;
                c.vy = (c.vy + fy - c.oy * 0.08) * 0.84;
                c.ox += c.vx; c.oy += c.vy;
                c.h = lerp(c.h, target, 0.15);
                const rot = c.ox * 0.4;
                c.el.style.transform = `translate(${c.ox}px, ${c.oy}px) rotate(${rot}deg) scale(${1 + c.h * 0.18})`;
                const k = c.h;
                c.el.style.color = `rgb(${Math.round(255 - k * 222)}, ${Math.round(255 - k * 105)}, 255)`;
            }

            // --- RGB split from mouse speed ---
            split = lerp(split, speed * 0.12, 0.2);
            speed *= 0.9;
            h1.style.setProperty('--split', split.toFixed(2) + 'px');
        }
        frame();
    }

    // ── Video Lightbox ──
    const lightbox      = document.getElementById('videoLightbox');
    const lbVideo       = document.getElementById('lightboxVideo');
    const lbClose       = document.getElementById('lightboxClose');
    const lbPlayBtn     = document.getElementById('lightboxPlayBtn');
    const iconPause     = document.getElementById('iconPause');
    const iconPlay      = document.getElementById('iconPlay');
    const lbFill        = document.getElementById('lightboxFill');
    const lbThumb       = document.getElementById('lightboxThumb');
    const lbTime        = document.getElementById('lightboxTime');
    const lbBar         = document.getElementById('lightboxBar');
    const lbRewind      = document.getElementById('lbRewind');
    const lbForward     = document.getElementById('lbForward');
    const lbFullscreen  = document.getElementById('lbFullscreen');
    const iconExpand    = document.getElementById('iconExpand');
    const iconCompress  = document.getElementById('iconCompress');
    const lbInner       = document.querySelector('.lightbox-inner');

    function formatTime(sec) {
        if (isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function syncIcons() {
        const paused = lbVideo.paused;
        iconPause.style.display = paused ? 'none'  : 'block';
        iconPlay.style.display  = paused ? 'block' : 'none';
    }

    function showFlash(text) {
        const el = document.createElement('div');
        el.className = 'lb-skip-flash';
        el.textContent = text;
        lbInner.style.position = 'relative';
        lbInner.appendChild(el);
        setTimeout(() => el.remove(), 750);
    }

    function skip(seconds) {
        lbVideo.currentTime = Math.max(0, Math.min(lbVideo.duration || 0, lbVideo.currentTime + seconds));
        showFlash(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
    }

    function openLightbox(src) {
        lbVideo.src = src;
        lbVideo.currentTime = 0;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lbVideo.play();
        syncIcons();
    }

    function closeLightbox() {
        lbVideo.pause();
        lbVideo.src = '';
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // exit fullscreen if active
        if (document.fullscreenElement) document.exitFullscreen();
    }

    // Open lightbox on card click
    document.querySelectorAll('.work-card').forEach(card => {
        card.addEventListener('click', () => {
            openLightbox(card.querySelector('video').src);
        });
    });

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')       { closeLightbox(); }
        if (e.key === ' ')            { e.preventDefault(); lbVideo.paused ? lbVideo.play() : lbVideo.pause(); }
        if (e.key === 'ArrowRight')   { skip(5); }
        if (e.key === 'ArrowLeft')    { skip(-5); }
        if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); }
    });

    // Play / Pause
    lbPlayBtn.addEventListener('click', () => { lbVideo.paused ? lbVideo.play() : lbVideo.pause(); });
    lbVideo.addEventListener('play',  syncIcons);
    lbVideo.addEventListener('pause', syncIcons);

    // Skip buttons
    lbRewind.addEventListener('click',  () => skip(-5));
    lbForward.addEventListener('click', () => skip(5));

    // Fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            lbInner.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    lbFullscreen.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', () => {
        const isFull = !!document.fullscreenElement;
        iconExpand.style.display   = isFull ? 'none'  : 'block';
        iconCompress.style.display = isFull ? 'block' : 'none';
    });

    // Progress bar update
    lbVideo.addEventListener('timeupdate', () => {
        if (!lbVideo.duration) return;
        const pct = (lbVideo.currentTime / lbVideo.duration) * 100;
        lbFill.style.width = pct + '%';
        lbBar.style.setProperty('--pct', pct + '%');
        lbThumb.style.left = pct + '%';
        lbTime.textContent = `${formatTime(lbVideo.currentTime)} / ${formatTime(lbVideo.duration)}`;
    });

    // Seek on bar click
    lbBar.addEventListener('click', (e) => {
        const rect = lbBar.getBoundingClientRect();
        lbVideo.currentTime = ((e.clientX - rect.left) / rect.width) * lbVideo.duration;
    });

    // Contact Form Logic
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            
            formStatus.textContent = `Thanks, ${name}! Your message has been sent. We'll be in touch soon.`;
            formStatus.style.color = '#ffffff'; 

            contactForm.reset();

            setTimeout(() => {
                formStatus.textContent = '';
            }, 5000);
        });
    }

    // Book a Call Logic
    const bookCallBtns = document.querySelectorAll('.book-call-btn');
    const modal = document.getElementById('callModal');
    const closeModal = document.querySelector('.close-modal');
    const modalMessage = document.getElementById('modalMessage');

    function openModal(msg) {
        modalMessage.innerHTML = msg;
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    bookCallBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const now = new Date();
            const hours = now.getHours();
            
            // Available: 9 AM to 11 AM (9:00 - 10:59) and 5 PM to 9 PM (17:00 - 20:59)
            const isMorning = hours >= 9 && hours < 11;
            const isEvening = hours >= 17 && hours < 21;
            
            if (isMorning || isEvening) {
                openModal(`You can reach me now at:<br><br><strong style="font-size: 1.8rem; color: var(--primary);">9680345324</strong>`);
            } else {
                let nextTime = "";
                if (hours < 9) {
                    nextTime = "today at 9:00 AM";
                } else if (hours >= 11 && hours < 17) {
                    nextTime = "today at 5:00 PM";
                } else {
                    nextTime = "tomorrow at 9:00 AM";
                }
                
                openModal(`I am currently unavailable.<br><br>The next time you can call is <strong>${nextTime}</strong>.`);
            }
        });
    });
});
