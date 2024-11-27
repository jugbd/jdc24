document.addEventListener("DOMContentLoaded", () => {

    const iconImages = document.querySelectorAll('.icon-square img');


    gsap.from(iconImages, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
        stagger: 0.2,
        delay: 0.3,
    });

    iconImages.forEach((img) => {
        img.addEventListener('mouseenter', () => {
            gsap.to(img, {
                scale: 1.15,
                rotation: 10,
                duration: 0.4,
                ease: "power3.out",
                boxShadow: "0px 12px 20px rgba(0, 0, 0, 0.25)",
                filter: "brightness(1.2) saturate(1.3)",
            });
        });

        img.addEventListener('mouseleave', () => {
            gsap.to(img, {
                scale: 1,
                rotation: 0,
                duration: 0.4,
                ease: "power2.inOut",
                boxShadow: "none",
                filter: "brightness(1) saturate(1)",
            });
        });
    });
});
