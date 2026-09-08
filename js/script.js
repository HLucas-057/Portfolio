"use strict";

/* ==========================================================
   SÉLECTEURS
========================================================== */

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-navigation");
const navigationLinks = document.querySelectorAll(".main-navigation a");
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("main section[id]");
const portrait = document.querySelector(".portrait");
const portraitFallback = document.querySelector(".portrait-fallback");
const videos = document.querySelectorAll("video");
const projectImages = document.querySelectorAll(
    ".browser-screen img, .media-image img, .post-image img"
);

/* ==========================================================
   ANNÉE AUTOMATIQUE
========================================================== */

const currentYearElement = document.querySelector("#current-year");

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

/* ==========================================================
   HEADER AU DÉFILEMENT
========================================================== */

function updateHeader() {
    if (!header) return;

    header.classList.toggle("is-scrolled", window.scrollY > 20);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

/* ==========================================================
   MENU MOBILE
========================================================== */

function closeMobileMenu() {
    if (!menuButton || !navigation) return;

    menuButton.classList.remove("is-active");
    navigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Ouvrir le menu");
}

function toggleMobileMenu() {
    if (!menuButton || !navigation) return;

    const willOpen = !navigation.classList.contains("is-open");

    menuButton.classList.toggle("is-active", willOpen);
    navigation.classList.toggle("is-open", willOpen);
    document.body.classList.toggle("menu-open", willOpen);

    menuButton.setAttribute("aria-expanded", String(willOpen));
    menuButton.setAttribute(
        "aria-label",
        willOpen ? "Fermer le menu" : "Ouvrir le menu"
    );
}

if (menuButton) {
    menuButton.addEventListener("click", toggleMobileMenu);
}

navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
        closeMobileMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

/* ==========================================================
   APPARITION DES ÉLÉMENTS
========================================================== */

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach((element) => {
        element.classList.add("is-visible");
    });
}

/* ==========================================================
   LIEN ACTIF DANS LA NAVIGATION
========================================================== */

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const currentId = entry.target.id;

                navigationLinks.forEach((link) => {
                    const isCurrent =
                        link.getAttribute("href") === `#${currentId}`;

                    link.classList.toggle("active", isCurrent);
                });
            });
        },
        {
            threshold: 0.35,
            rootMargin: "-80px 0px -45% 0px"
        }
    );

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
}

/* ==========================================================
   PORTRAIT MANQUANT
========================================================== */

if (portrait) {
    portrait.addEventListener("load", () => {
        portrait.hidden = false;

        if (portraitFallback) {
            portraitFallback.hidden = true;
        }
    });

    portrait.addEventListener("error", () => {
        portrait.hidden = true;

        if (portraitFallback) {
            portraitFallback.hidden = false;
        }
    });

    if (!portrait.complete) {
        portrait.hidden = false;
    } else if (portrait.naturalWidth === 0) {
        portrait.hidden = true;

        if (portraitFallback) {
            portraitFallback.hidden = false;
        }
    }
}

/* ==========================================================
   IMAGES DE PROJETS MANQUANTES
========================================================== */

projectImages.forEach((image) => {
    const parent = image.parentElement;

    const showImagePlaceholder = () => {
        image.hidden = true;

        if (!parent || parent.querySelector(".generated-placeholder")) {
            return;
        }

        const placeholder = document.createElement("div");
        placeholder.className = "media-placeholder generated-placeholder";

        const fileName = image
            .getAttribute("src")
            .split("/")
            .pop();

        placeholder.innerHTML = `
            <span>Visuel à ajouter</span>
            <small>${fileName}</small>
        `;

        parent.appendChild(placeholder);
    };

    image.addEventListener("error", showImagePlaceholder);

    if (image.complete && image.naturalWidth === 0) {
        showImagePlaceholder();
    }
});

/* ==========================================================
   VIDÉOS MANQUANTES
========================================================== */

videos.forEach((video) => {
    const wrapper = video.closest(".video-wrapper");

    const showVideoPlaceholder = () => {
        if (wrapper) {
            wrapper.classList.add("media-missing");
        }
    };

    const showVideo = () => {
        if (wrapper) {
            wrapper.classList.remove("media-missing");
        }
    };

    video.addEventListener("loadedmetadata", showVideo);
    video.addEventListener("error", showVideoPlaceholder);

    const source = video.querySelector("source");

    if (source) {
        source.addEventListener("error", showVideoPlaceholder);
    }
});

/* ==========================================================
   PAUSE DES AUTRES VIDÉOS
========================================================== */

videos.forEach((currentVideo) => {
    currentVideo.addEventListener("play", () => {
        videos.forEach((otherVideo) => {
            if (otherVideo !== currentVideo && !otherVideo.paused) {
                otherVideo.pause();
            }
        });
    });
});

/* ==========================================================
   PAUSE DES VIDÉOS À LA FERMETURE D'UN DETAILS
========================================================== */

document.querySelectorAll("details").forEach((detailsElement) => {
    detailsElement.addEventListener("toggle", () => {
        if (detailsElement.open) return;

        detailsElement.querySelectorAll("video").forEach((video) => {
            video.pause();
        });
    });
});
