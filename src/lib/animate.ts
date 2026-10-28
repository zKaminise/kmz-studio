import { gsap } from "./motion";

export function animate() {
  const media = gsap.matchMedia();
  const html = document.documentElement;

  media.add("(prefers-reduced-motion: no-preference)", (context) => {
    const hero = document.querySelector<HTMLElement>(".hero");
    let entry: gsap.core.Timeline | undefined;
    let introActive = false;
    let failOpen: ReturnType<typeof setTimeout> | undefined;

    function finishIntro() {
      introActive = false;
      html.dataset.intro = "done";
      clearTimeout(failOpen);
    }

    function playEntry(replay = false) {
      if (!hero) return;
      entry?.kill();
      const intro = replay || html.dataset.intro === "pending";
      const compact = window.matchMedia("(max-width: 700px)").matches;
      const revealAt = intro ? 1.05 : 0;
      entry = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (intro) {
        introActive = true;
        html.dataset.intro = "playing";
        // Animate the alpha edge of the supplied logo, then reveal its original colors.
        entry
          .set(".brand-intro__panel", { yPercent: 0 }, 0)
          .set(".brand-intro__outline", { opacity: 1 }, 0)
          .fromTo(
            ".brand-intro__mark",
            { y: 10, scale: 0.96 },
            { y: 0, scale: 1, duration: 0.8 },
            0,
          )
          .fromTo(
            ".brand-intro__outline",
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 -2% 0 -2%)",
              duration: 0.55,
              ease: "power2.inOut",
            },
            0.05,
          )
          .fromTo(
            ".brand-intro__fill",
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 0.5,
              ease: "power2.inOut",
            },
            0.43,
          )
          .to(".brand-intro__outline", { opacity: 0, duration: 0.25 }, 0.78)
          .to(
            ".brand-intro__panel",
            {
              yPercent: -100,
              duration: compact ? 0.78 : 0.88,
              ease: "power4.inOut",
            },
            0.96,
          )
          .call(finishIntro, [], compact ? 1.76 : 1.86);
        clearTimeout(failOpen);
        failOpen = setTimeout(finishIntro, 3500);
      }

      entry
        .fromTo(
          ".header .brand, .header .nav, .header .menu-toggle",
          { y: -14 },
          { y: 0, duration: 0.65, stagger: 0.05 },
          revealAt + 0.2,
        )
        .fromTo(
          ".hero-line > span",
          { yPercent: 112 },
          { yPercent: 0, duration: 0.95, stagger: 0.085, ease: "power4.out" },
          revealAt,
        )
        .fromTo(
          ".hero-enter",
          { y: compact ? 24 : 35 },
          { y: 0, duration: 0.85, stagger: 0.09 },
          revealAt + 0.15,
        )
        .fromTo(
          ".hero-art-back",
          { xPercent: 18, y: compact ? 80 : 125, rotation: -23, scale: 0.88 },
          {
            xPercent: 0,
            y: 0,
            rotation: -9,
            scale: 1,
            duration: 1.15,
            ease: "power4.out",
          },
          revealAt + 0.05,
        )
        .fromTo(
          ".hero-art-front",
          { xPercent: -16, y: compact ? 105 : 160, rotation: 16, scale: 0.88 },
          {
            xPercent: 0,
            y: 0,
            rotation: 4,
            scale: 1,
            duration: 1.2,
            ease: "power4.out",
          },
          revealAt + 0.17,
        )
        .fromTo(
          ".hero-bottom, .art-note",
          { y: 18 },
          { y: 0, duration: 0.7 },
          revealAt + 0.35,
        );
    }

    const skip = () => {
      if (introActive) {
        entry?.progress(1);
        finishIntro();
      }
    };
    const skipKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") skip();
    };
    const replay = () => context.add(() => playEntry(true));
    playEntry();
    window.addEventListener("kmz:skip-intro", skip);
    window.addEventListener("kmz:replay-intro", replay);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    window.addEventListener("keydown", skipKeyboard);

    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
      if (
        element.matches(".works-intro") ||
        element.closest(".selected-grid") ||
        element.getBoundingClientRect().top < window.innerHeight * 0.92
      )
        return;
      gsap.from(element, {
        y: 38,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 94%", once: true },
      });
    });

    return () => {
      clearTimeout(failOpen);
      window.removeEventListener("kmz:skip-intro", skip);
      window.removeEventListener("kmz:replay-intro", replay);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
      window.removeEventListener("keydown", skipKeyboard);
      finishIntro();
    };
  });

  media.add(
    {
      desktop: "(min-width: 1024px)",
      compact: "(max-width: 1023px)",
      motion: "(prefers-reduced-motion: no-preference)",
    },
    (context) => {
      if (!context.conditions?.motion || !document.querySelector(".hero"))
        return;
      const desktop = context.conditions.desktop;
      // Separate wrappers keep the entrance and native-scroll transforms independent.
      gsap.to(".hero-art-stage", {
        y: desktop ? -100 : -35,
        rotation: desktop ? -2 : -1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(".hero-copy", {
        y: desktop ? -26 : -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      gsap.fromTo(
        ".works-intro",
        { y: desktop ? 85 : 48 },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".selected",
            start: "top 92%",
            end: "top 38%",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        },
      );
      gsap.utils
        .toArray<HTMLElement>(".selected-grid > .project-card")
        .forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: desktop ? 100 : 56 },
            {
              y: 0,
              duration: 1.05,
              ease: "power4.out",
              delay: desktop ? (index % 2) * 0.08 : 0,
              scrollTrigger: { trigger: card, start: "top 96%", once: true },
            },
          );
        });
    },
  );

  return () => {
    media.revert();
    html.dataset.intro = "done";
  };
}
