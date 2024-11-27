document.addEventListener("DOMContentLoaded", () => {
    // GSAP basic animations for loading
    gsap.from(".joinourteamimg", {
        opacity: 0,
        scale: 0.5,
        duration: 1,
        y: 50,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });

    // Scroll-trigger animations for images
    gsap.utils.toArray(".joinourteamimg").forEach((img) => {
        gsap.fromTo(
            img,
            { opacity: 0, scale: 0.8, y: 100 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                scrollTrigger: {
                    trigger: img,
                    start: "top 80%",
                    end: "top 20%",
                    toggleActions: "play reverse play reverse"
                },
                duration: 1,
                ease: "power2.out"
            }
        );
    });

    // Add hover animations with GSAP
    const details = document.querySelectorAll(".joinourteam-details");

    details.forEach((detail) => {
        const img = detail.querySelector(".joinourteamimg");
        const text = detail.querySelector("h3");

        detail.addEventListener("mouseenter", () => {
            gsap.to(img, {
                scale: 1.1,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(text, {
                scale: 1.05,
                color: "#ff6347", // Change text color
                duration: 0.3,
                ease: "power2.out"
            });
        });

        detail.addEventListener("mouseleave", () => {
            gsap.to(img, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(text, {
                scale: 1,
                color: "#000", // Revert to original color
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
});
