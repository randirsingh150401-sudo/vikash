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
