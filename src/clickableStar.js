document.addEventListener("DOMContentLoaded", () => {
  const marbleCount = 5;
  let current = 1;

  const enableMarble = (i) => {
    const marble = document.querySelector(`#marble${i}`);
    if (!marble) return;
    marble.classList.add("clickable");

    const sphere = marble.querySelector(`#marble${i}-sphere`);
    if (sphere) {
      // Add glow pulse animation
      sphere.setAttribute("animation__pulse", {
        property: "scale",
        dir: "alternate",
        dur: 1000,
        loop: true,
        to: "1.3 1.3 1.3",
      });
    }

    marble.addEventListener(
      "click",
      () => {
        // Disable current marble
        marble.classList.remove("clickable");
        sphere?.removeAttribute("animation__pulse");

        // Hide marble sphere
        sphere?.setAttribute("visible", false);

        // Reveal nebula with fade-in
        const nebula = document.querySelector(`#nebula${i}`);
        if (nebula) {
          nebula.setAttribute("visible", true);
          nebula.setAttribute("opacity", "0");
          nebula.setAttribute("animation__fadein", {
            property: "opacity",
            to: 1,
            dur: 2000,
            easing: "easeInOutQuad",
            startEvents: "startFadeIn",
          });
          nebula.emit("startFadeIn");
        }

        // Reveal phrase with fade-in & emissive glow
        const phrase = document.querySelector(`#phrase${i}`);
        if (phrase) {
          phrase.setAttribute("visible", true);
          phrase.setAttribute("opacity", "0");
          phrase.setAttribute("animation__fadein", {
            property: "opacity",
            to: 1,
            dur: 2000,
            easing: "easeInOutQuad",
            startEvents: "startFadeIn",
          });
          phrase.emit("startFadeIn");
        }

        // If last marble clicked, show Neptune
        if (i === marbleCount) {
          const neptune = document.querySelector("#neptune");
          if (neptune) {
            neptune.setAttribute("visible", true);
            neptune.setAttribute("opacity", "0");
            neptune.setAttribute("animation__fadein", {
              property: "opacity",
              to: 1,
              dur: 2000,
              easing: "easeInOutQuad",
              startEvents: "startFadeIn",
            });
            neptune.emit("startFadeIn");
          }
        } else {
          // Enable next marble
          current++;
          enableMarble(current);
        }
      },
      {once: true}
    );
  };

  enableMarble(current);
});
