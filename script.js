/* ============================
   Mobile menu toggle
============================ */
const menuOpenButton = document.querySelector("#menu-open-button");
const menuCloseButton = document.querySelector("#menu-close-button");

menuOpenButton.addEventListener("click", () => {
    document.body.classList.toggle("show-mobile-menu");
});

menuCloseButton.addEventListener("click", () => menuOpenButton.click());

// Close the mobile menu automatically after a nav link is tapped
document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
        document.body.classList.remove("show-mobile-menu");
    });
});

/* Our Services — auto-scroll + swipe. Replaces the old Swiper init
   for this section only (Swiper is still used for Reviews). */
const servicesStripWrap = document.querySelector('#services-strip-wrap');

if (servicesStripWrap) {
    let isHovering = false;
    let isDragging = false;
    let ignoreNextScrollEvent = false; // tells the scroll listener "this one was us, not the user"
    let lastInteraction = 0;
    const AUTO_SCROLL_SPEED = 0.6; // back to full, normal pace
    const RESUME_DELAY = 1500;

    function autoScrollStep() {
        const recentlyInteracted = Date.now() - lastInteraction < RESUME_DELAY;
        if (!isHovering && !isDragging && !recentlyInteracted) {
            ignoreNextScrollEvent = true;
            servicesStripWrap.scrollLeft += AUTO_SCROLL_SPEED;
            if (servicesStripWrap.scrollLeft >= servicesStripWrap.scrollWidth / 2) {
                servicesStripWrap.scrollLeft = 0;
            }
        }
        requestAnimationFrame(autoScrollStep);
    }
    requestAnimationFrame(autoScrollStep);

    // Only counts as "user touched it" if WE didn't just cause this
    // scroll event ourselves via the auto-scroll tick above.
    servicesStripWrap.addEventListener('scroll', () => {
        if (ignoreNextScrollEvent) {
            ignoreNextScrollEvent = false;
            return;
        }
        if (!isDragging) lastInteraction = Date.now();
    }, { passive: true });

    // Desktop hover-to-pause
    servicesStripWrap.addEventListener('mouseenter', () => { isHovering = true; });
    servicesStripWrap.addEventListener('mouseleave', () => {
        isHovering = false;
        isDragging = false;
        servicesStripWrap.classList.remove('dragging');
        lastInteraction = Date.now();
    });

    // Desktop click-drag
    let startX = 0;
    let startScrollLeft = 0;
    servicesStripWrap.addEventListener('mousedown', (e) => {
        isDragging = true;
        servicesStripWrap.classList.add('dragging');
        startX = e.pageX;
        startScrollLeft = servicesStripWrap.scrollLeft;
    });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        servicesStripWrap.scrollLeft = startScrollLeft - (e.pageX - startX);
    });
    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        servicesStripWrap.classList.remove('dragging');
        lastInteraction = Date.now();
    });

    // Mobile touch
    servicesStripWrap.addEventListener('touchstart', () => {
        lastInteraction = Date.now();
    }, { passive: true });
}

const reviewsSwiper = new Swiper('.reviews-swiper', {
  slidesPerView: 1,
  loop: true,
  grabCursor: true,
  spaceBetween: 20,
  autoplay: {
    delay: 5000,
    disableOnInteraction: true,
  },
  pagination: {
    el: '.reviews-pagination',
    clickable: true,
    dynamicBullets: true,
  },
  navigation: {
    nextEl: '.reviews-next',
    prevEl: '.reviews-prev',
  },
});

/* ============================
   Sticky header: shrink + shadow on scroll
============================ */
const header = document.querySelector("#site-header");
const scrollProgress = document.querySelector("#scroll-progress");
const backToTopButton = document.querySelector("#back-to-top");

function onScroll() {
    const scrollY = window.scrollY;

    header.classList.toggle("scrolled", scrollY > 30);
    backToTopButton.classList.toggle("visible", scrollY > 500);

    // Scroll progress bar
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ============================
   Active nav-link highlighting while scrolling
============================ */
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
                });
            }
        });
    },
    { rootMargin: "-45% 0px -45% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

/* ============================
   Reveal-on-scroll animations
============================ */
const revealItems = document.querySelectorAll(".reveal, .feature-item, .attraction-card");

const revealObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Small stagger so grouped items (like gallery photos) don't all pop at once
                const delay = Math.min(index * 40, 300);
                setTimeout(() => entry.target.classList.add("in-view"), delay);
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);

revealItems.forEach((item) => revealObserver.observe(item));

/* ============================
   Hero image subtle tilt on mouse move
============================ */
const heroTilt = document.querySelector("#hero-tilt");

if (heroTilt && window.matchMedia("(hover: hover)").matches) {
    heroTilt.addEventListener("mousemove", (event) => {
        const rect = heroTilt.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const image = heroTilt.querySelector(".hero-image");
        image.style.transform = `rotateY(${x * 10}deg) rotateX(${y * -10}deg) scale(1.03)`;
    });

    heroTilt.addEventListener("mouseleave", () => {
        const image = heroTilt.querySelector(".hero-image");
        image.style.transform = "rotateY(0) rotateX(0) scale(1)";
    });
}

/* ============================
   Gallery lightbox
============================ */
const galleryImages = Array.from(document.querySelectorAll(".gallery-item:not(.gallery-video) .gallery-image"));
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxClose = document.querySelector("#lightbox-close");
const lightboxPrev = document.querySelector("#lightbox-prev");
const lightboxNext = document.querySelector("#lightbox-next");
let currentImageIndex = 0;

function openLightbox(index) {
    currentImageIndex = index;
    lightboxImage.src = galleryImages[index].src;
    lightboxImage.alt = galleryImages[index].alt;
    lightbox.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

function showImage(delta) {
    currentImageIndex = (currentImageIndex + delta + galleryImages.length) % galleryImages.length;
    lightboxImage.src = galleryImages[currentImageIndex].src;
    lightboxImage.alt = galleryImages[currentImageIndex].alt;
}

galleryImages.forEach((image, index) => {
    image.addEventListener("click", () => openLightbox(index));
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => showImage(-1));
lightboxNext.addEventListener("click", () => showImage(1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showImage(-1);
    if (event.key === "ArrowRight") showImage(1);
});

/* ============================
   Gallery: expand/collapse the preview tab
============================ */
const galleryWrap = document.querySelector("#gallery-wrap");
const galleryExpandButton = document.querySelector("#gallery-expand-button");

if (galleryWrap && galleryExpandButton) {
    galleryExpandButton.addEventListener("click", () => {
        const isExpanded = galleryWrap.classList.toggle("expanded");
        galleryExpandButton.setAttribute("aria-expanded", String(isExpanded));
        galleryExpandButton.querySelector(".expand-text").textContent = isExpanded
            ? "Show Fewer Photos"
            : "View Full Gallery";

        // If the guest collapses it again, scroll back up so they land
        // at the top of the gallery instead of somewhere in the middle.
        if (!isExpanded) {
            galleryWrap.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

const galleryCollapseButton = document.querySelector("#gallery-collapse-button");

if (galleryWrap && galleryCollapseButton) {
    galleryCollapseButton.addEventListener("click", () => {
        galleryWrap.classList.remove("expanded");
        galleryWrap.style.maxHeight = ""; // only needed if you're using the dynamic-height JS version

        galleryExpandButton.setAttribute("aria-expanded", "false");
        galleryExpandButton.querySelector(".expand-text").textContent = "View Full Gallery";

        galleryWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

/* ============================
   Contact form
   There's no backend to send this to yet, so submitting validates the
   fields, then hands off to the visitor's email app pre-filled with
   their message (via a mailto: link) rather than silently doing nothing.
============================ */
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const submitButton = document.querySelector("#submit-button");

const formNameInput = document.querySelector("#form-name");
const formEmailInput = document.querySelector("#form-email");
const formPhoneInput = document.querySelector("#form-phone");
const formMessageInput = document.querySelector("#form-message");

function setFieldError(field, hasError) {
    field.classList.toggle("input-error", hasError);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
    // Accepts digits, spaces, +, ( ) and - ; requires at least 7 digits overall
    const digitCount = (value.match(/\d/g) || []).length;
    return digitCount >= 7 && /^[\d\s+()-]+$/.test(value);
}

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = formNameInput.value.trim();
    const email = formEmailInput.value.trim();
    const phone = formPhoneInput.value.trim();
    const message = formMessageInput.value.trim();

    const nameValid = name.length > 1;
    const emailValid = isValidEmail(email);
    const phoneValid = isValidPhone(phone);
    const messageValid = message.length > 5;

    setFieldError(formNameInput, !nameValid);
    setFieldError(formEmailInput, !emailValid);
    setFieldError(formPhoneInput, !phoneValid);
    setFieldError(formMessageInput, !messageValid);

    if (!nameValid || !emailValid || !phoneValid || !messageValid) {
        formStatus.textContent = "Please fill in every field with a valid name, email, phone number and message.";
        formStatus.className = "form-status error";
        return;
    }

    submitButton.disabled = true;
    formStatus.textContent = "Opening your email app...";
    formStatus.className = "form-status success";

    const subject = encodeURIComponent(`Enquiry from ${name} — Ebenezer Lodge website`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\nEmail: ${email}\nPhone: ${phone}`);
    window.location.href = `mailto:ebenezerguests@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
        formStatus.textContent = "Sent Successfully! Thank you for reaching out. We'll get back to you as soon as possible.";
        submitButton.disabled = false;
        contactForm.reset();
    }, 800);
});

[formNameInput, formEmailInput, formPhoneInput, formMessageInput].forEach((field) => {
    field.addEventListener("input", () => setFieldError(field, false));
});
