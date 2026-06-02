/* =========================================
   CONVERSE PRESENTATION SYSTEM
   Navegação por clique, teclado e progresso
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const slides = Array.from(document.querySelectorAll(".slide"));
    const progressUi = document.getElementById("progressUi");
    const progressFill = document.getElementById("progressFill");
    const progressCounter = document.getElementById("progressCounter");

    let currentIndex = 0;
    let progressTimeout = null;

    document.body.classList.add("is-presenting");

    function formatNumber(number) {
        return String(number).padStart(2, "0");
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

    function updateProgress(mouseX = window.innerWidth / 2) {
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

    function goToSlide(index) {
        const targetIndex = Math.max(0, Math.min(index, slides.length - 1));
        currentIndex = targetIndex;

        updateActiveSlides();

        slides[currentIndex].scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        updateActiveSlides();
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

    function showProgress(mouseX) {
        updateProgress(mouseX);
        progressUi.classList.add("is-visible");

        clearTimeout(progressTimeout);

        progressTimeout = setTimeout(() => {
            progressUi.classList.remove("is-visible");
        }, 1400);
    }

    function syncCurrentSlideByScroll() {
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

        currentIndex = closestIndex;
        updateProgress();
        updateActiveSlides();
    }

    document.addEventListener("keydown", (event) => {
        const key = event.key;

        if (
            key === "ArrowRight" ||
            key === "ArrowDown" ||
            key === " " ||
            key === "PageDown"
        ) {
            event.preventDefault();
            nextSlide();
            showProgress(window.innerWidth / 2);
        }

        if (
            key === "ArrowLeft" ||
            key === "ArrowUp" ||
            key === "PageUp"
        ) {
            event.preventDefault();
            previousSlide();
            showProgress(window.innerWidth / 2);
        }

        if (key === "Home") {
            event.preventDefault();
            goToSlide(0);
            showProgress(window.innerWidth / 2);
        }

        if (key === "End") {
            event.preventDefault();
            goToSlide(slides.length - 1);
            showProgress(window.innerWidth / 2);
        }
    });

    document.addEventListener("click", (event) => {
        const clickedElement = event.target;

        if (
            clickedElement.closest("a") ||
            clickedElement.closest("button") ||
            clickedElement.closest(".source-pill")
        ) {
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

    document.addEventListener("mousemove", (event) => {
        const distanceFromBottom = window.innerHeight - event.clientY;

        if (distanceFromBottom <= 115) {
            showProgress(event.clientX);
        }
    });

    window.addEventListener("scroll", () => {
        window.requestAnimationFrame(syncCurrentSlideByScroll);
    });

    window.addEventListener("resize", () => {
        updateProgress();
    });

    updateProgress();
});

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