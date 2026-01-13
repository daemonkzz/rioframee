/* ============================
   ENHANCEMENTS - JavaScript
   Premium Effects & Interactions
   ============================ */

document.addEventListener('DOMContentLoaded', function () {
    initBackToTop();
    initCustomCursor();
    initParallax();
    initLoadingSkeletons();
});

/* ============================
   BACK TO TOP BUTTON
   ============================ */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    // Show/hide on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });

    // Scroll to top on click
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* ============================
   CUSTOM CURSOR
   ============================ */
function initCustomCursor() {
    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (!dot || !outline) return;

    // Check if touch device
    if ('ontouchstart' in window) {
        dot.style.display = 'none';
        outline.style.display = 'none';
        return;
    }

    let cursorX = 0, cursorY = 0;
    let outlineX = 0, outlineY = 0;

    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;

        // Dot follows immediately
        dot.style.left = cursorX + 'px';
        dot.style.top = cursorY + 'px';
    });

    // Smooth outline follow
    function animateOutline() {
        outlineX += (cursorX - outlineX) * 0.15;
        outlineY += (cursorY - outlineY) * 0.15;

        outline.style.left = outlineX + 'px';
        outline.style.top = outlineY + 'px';

        requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover effects on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .service-box');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('hover');
            outline.classList.add('hover');
        });

        el.addEventListener('mouseleave', () => {
            dot.classList.remove('hover');
            outline.classList.remove('hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        outline.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        outline.style.opacity = '1';
    });
}

/* ============================
   PARALLAX SCROLLING
   ============================ */
function initParallax() {
    // Hakkımızda bölümündeki RioFrame görseline parallax uygula
    const aboutVisual = document.querySelector('.about-visual');
    const aboutImage = document.querySelector('.about-image-wrapper');
    const target = aboutImage || aboutVisual;

    if (!target) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    });

    function updateParallax() {
        const rect = target.getBoundingClientRect();

        // Element viewport'ta görünürse
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Scroll pozisyonuna göre Y offset hesapla
            const speed = 0.12;
            const yPos = (rect.top - window.innerHeight / 2) * speed;

            target.style.transform = `translateY(${yPos}px)`;
        }
    }
}

/* ============================
   LOADING SKELETONS
   ============================ */
function initLoadingSkeletons() {
    // The skeleton will be shown automatically via CSS
    // This function creates skeleton HTML when needed

    window.createSkeletonCards = function (container, count = 6) {
        if (!container) return;

        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-card-wrapper">
                    <div class="skeleton skeleton-card"></div>
                    <div class="skeleton skeleton-text" style="margin-top: 12px;"></div>
                    <div class="skeleton skeleton-text short"></div>
                </div>
            `;
        }
        container.innerHTML = html;
    };

    window.removeSkeletons = function (container) {
        if (!container) return;
        const skeletons = container.querySelectorAll('.skeleton-card-wrapper');
        skeletons.forEach(s => s.remove());
    };
}
