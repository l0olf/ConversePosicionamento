/* =========================================
   CONVERSE PRESENTATION SYSTEM
   Navegação por clique, teclado, progresso,
   bloqueio de scroll e modal inicial
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const slides = Array.from(document.querySelectorAll(".slide"));

    const progressUi = document.getElementById("progressUi");
    const progressFill = document.getElementById("progressFill");
    const progressCounter = document.getElementById("progressCounter");

    const introModal = document.getElementById("introModal");
    const introModalButton = document.getElementById("introModalButton");

    let currentIndex = 0;
    let progressTimeout = null;
    let scrollSyncRaf = null;

    document.body.classList.add("is-presenting");

    /* =========================================
       BLOQUEAR SCROLL MANUAL DO MOUSE / TOUCHPAD
       Mantém navegação apenas por clique e teclado
       ========================================= */

    function lockManualScroll() {
        window.addEventListener(
            "wheel",
            (event) => {
                event.preventDefault();
            },
            { passive: false }
        );

        window.addEventListener(
            "touchmove",
            (event) => {
                event.preventDefault();
            },
            { passive: false }
        );
    }

    lockManualScroll();

    /* =========================================
       HELPERS
       ========================================= */

    function formatNumber(number) {
        return String(number).padStart(2, "0");
    }

    function hasModalOpen() {
        return introModal && !introModal.classList.contains("is-hidden");
    }

    /* =========================================
       ATIVAR ANIMAÇÕES APENAS NO SLIDE ATUAL
       ========================================= */

    function updateActiveSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove("is-active", "is-before", "is-after");

            if (index === currentIndex) {
                slide.classList.add("is-active");
            } else if (index < currentIndex) {
                slide.classList.add("is-before");
            } else {
                slide.classList.add("is-after");
            }
        });
    }

    /* =========================================
       PROGRESSO
       ========================================= */

    function updateProgress(mouseX = window.innerWidth / 2) {
        if (!progressFill || !progressCounter) return;

        const totalSlides = slides.length;
        const currentSlide = currentIndex + 1;

        const progressPercent = totalSlides <= 1
            ? 100
            : ((currentSlide - 1) / (totalSlides - 1)) * 100;

        progressFill.style.width = `${progressPercent}%`;
        progressCounter.textContent = `${formatNumber(currentSlide)}/${formatNumber(totalSlides)}`;

        const safeMargin = 72;
        const counterX = Math.max(
            safeMargin,
            Math.min(mouseX, window.innerWidth - safeMargin)
        );

        progressCounter.style.left = `${counterX}px`;
    }

    function showProgress(mouseX = window.innerWidth / 2) {
        if (!progressUi) return;

        updateProgress(mouseX);
        progressUi.classList.add("is-visible");

        clearTimeout(progressTimeout);

        progressTimeout = setTimeout(() => {
            progressUi.classList.remove("is-visible");
        }, 1400);
    }

    /* =========================================
       NAVEGAÇÃO
       ========================================= */

    function goToSlide(index, options = {}) {
        const { smooth = true } = options;

        if (!slides.length) return;

        const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
        currentIndex = targetIndex;

        updateActiveSlides();

        slides[currentIndex].scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "start"
        });

        updateProgress();
    }

    function nextSlide() {
        if (currentIndex < slides.length - 1) {
            goToSlide(currentIndex + 1);
        }
    }

    function previousSlide() {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        }
    }

    function syncCurrentSlideByScroll() {
        if (!slides.length) return;

        const viewportMiddle = window.scrollY + window.innerHeight / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        slides.forEach((slide, index) => {
            const slideMiddle = slide.offsetTop + slide.offsetHeight / 2;
            const distance = Math.abs(viewportMiddle - slideMiddle);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== currentIndex) {
            currentIndex = closestIndex;
            updateActiveSlides();
            updateProgress();
        }
    }

    /* =========================================
       MODAL INICIAL
       ========================================= */

    async function enterFullscreen() {
        const element = document.documentElement;

        try {
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
        } catch (error) {
            console.warn("Fullscreen não foi ativado:", error);
        }
    }

    async function closeIntroModal() {
        await enterFullscreen();

        if (!introModal) return;

        introModal.classList.add("is-hidden");

        setTimeout(() => {
            introModal.style.display = "none";
        }, 500);

        goToSlide(0, { smooth: false });
        showProgress(window.innerWidth / 2);
    }

    if (introModalButton) {
        introModalButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeIntroModal();
        });
    }

    if (introModal) {
        introModal.addEventListener("click", (event) => {
            if (
                event.target === introModal ||
                event.target.classList.contains("intro-modal-backdrop")
            ) {
                closeIntroModal();
            }
        });
    }

    /* =========================================
       EVENTOS DE TECLADO
       ========================================= */

    document.addEventListener("keydown", (event) => {
        const key = event.key;

        if (hasModalOpen()) {
            if (key === "Enter" || key === "Escape" || key === " ") {
                event.preventDefault();
                closeIntroModal();
            }

            return;
        }

        if (
            key === "ArrowRight" ||
            key === "ArrowDown" ||
            key === " " ||
            key === "PageDown"
        ) {
            event.preventDefault();
            nextSlide();
            showProgress(window.innerWidth / 2);
            return;
        }

        if (
            key === "ArrowLeft" ||
            key === "ArrowUp" ||
            key === "PageUp"
        ) {
            event.preventDefault();
            previousSlide();
            showProgress(window.innerWidth / 2);
            return;
        }

        if (key === "Home") {
            event.preventDefault();
            goToSlide(0);
            showProgress(window.innerWidth / 2);
            return;
        }

        if (key === "End") {
            event.preventDefault();
            goToSlide(slides.length - 1);
            showProgress(window.innerWidth / 2);
        }
    });

    /* =========================================
       CLIQUE NAS LATERAIS
       ========================================= */

    document.addEventListener("click", (event) => {
        if (event.target.closest(".intro-modal")) {
            return;
        }

        const clickedElement = event.target;

        if (
            clickedElement.closest("a") ||
            clickedElement.closest("button") ||
            clickedElement.closest(".source-pill")
        ) {
            return;
        }

        if (hasModalOpen()) {
            return;
        }

        const clickX = event.clientX;
        const screenMiddle = window.innerWidth / 2;

        if (clickX >= screenMiddle) {
            nextSlide();
        } else {
            previousSlide();
        }

        showProgress(clickX);
    });

    /* =========================================
       PROGRESSO NO HOVER INFERIOR
       ========================================= */

    document.addEventListener("mousemove", (event) => {
        if (hasModalOpen()) return;

        const distanceFromBottom = window.innerHeight - event.clientY;

        if (distanceFromBottom <= 115) {
            showProgress(event.clientX);
        }
    });

    /* =========================================
       SINCRONIZAR COM SCROLL PROGRAMÁTICO
       ========================================= */

    window.addEventListener("scroll", () => {
        if (scrollSyncRaf) {
            cancelAnimationFrame(scrollSyncRaf);
        }

        scrollSyncRaf = window.requestAnimationFrame(() => {
            syncCurrentSlideByScroll();
        });
    });

    window.addEventListener("resize", () => {
        updateProgress();
    });

    /* =========================================
       ESTADO INICIAL
       Corrige bug do primeiro slide no Vercel
       ========================================= */

    currentIndex = 0;
    updateActiveSlides();
    updateProgress();

    window.requestAnimationFrame(() => {
        goToSlide(0, { smooth: false });
        updateActiveSlides();
        updateProgress();
    });
});