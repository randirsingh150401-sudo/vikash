document.addEventListener('DOMContentLoaded', () => {
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
