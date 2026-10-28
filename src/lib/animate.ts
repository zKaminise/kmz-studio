import { gsap } from "./motion";
export function animate() {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    if (document.querySelector(".hero")) {
      gsap.from(".hero-line > span", {
        yPercent: 108,
        duration: 1.1,
        stagger: 0.1,
        ease: "power4.out",
      });
      gsap.from(".hero-enter", {
        y: 18,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.from(".hero-art > a", {
        y: 40,
        rotation: 0,
        duration: 1.1,
        stagger: 0.13,
        delay: 0.35,
        ease: "power3.out",
      });
    }
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
      // Above-the-fold content stays visible; each offscreen reveal is progressive enhancement.
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92)
        return;
      gsap.from(element, {
        y: 38,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 94%", once: true },
      });
    });
  });
  media.add(
    "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    () => {
      if (!document.querySelector(".hero")) return;
      gsap.to(".hero-art-front", {
        y: -65,
        rotation: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      });
      gsap.to(".hero-art-back", {
        y: 30,
        rotation: -8,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.65,
        },
      });
      gsap.from(".works-intro", {
        y: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".selected",
          start: "top bottom",
          end: "top 38%",
          scrub: 0.5,
        },
      });
    },
  );
  return () => media.revert();
}
