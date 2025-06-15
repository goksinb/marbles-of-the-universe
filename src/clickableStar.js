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
            to: 0.3,
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

        // If last marble clicked, show Island
        // Show Island with slow fade-in
        if (i === marbleCount) {
          const island = document.querySelector("#goksin-island-entity");
          if (island) {
            island.setAttribute("visible", true);
            island.setAttribute("opacity", "0"); // Start from opacity 0

            // Animation to fade the island in
            island.setAttribute("animation__fadein", {
              property: "opacity",
              to: 1, // Fade to opacity 1
              dur: 2000, // Duration of the fade
              easing: "easeInOutQuad", // Easing function
              startEvents: "startFadeIn",
            });

            island.emit("startFadeIn"); // Start the fade-in animation            island.emit("startFadeIn"); // Start the fade-in animation
            island.classList.add("clickable"); // Ensure the island is clickable
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

window.addEventListener("DOMContentLoaded", function () {
  document
    .querySelector("#goksin-island-entity")
    .addEventListener("click", function () {
      window.location.href = "island.html";
    });
});

AFRAME.registerComponent("thumbstick-movement", {
  schema: {
    speed: {type: "number", default: 1},
    movementTarget: {type: "selector", default: null},
  },

  init: function () {
    this.axis = [0, 0];
    this.direction = new THREE.Vector3();

    this.el.addEventListener("axismove", (e) => {
      this.axis[0] = e.detail.axis[2]; // Left/right
      this.axis[1] = e.detail.axis[3]; // Forward/backward
      console.log("Joystick axis:", this.axis);
    });
  },

  tick: function (time, deltaTime) {
    if (Math.abs(this.axis[0]) < 0.05 && Math.abs(this.axis[1]) < 0.05) return;
    const target = this.data.movementTarget;
    if (!target) return;

    const moveDistance = (this.data.speed * deltaTime) / 1000;

    const camera = this.el.sceneEl.camera;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    move.addScaledVector(cameraDirection, -this.axis[1]);
    move.addScaledVector(right, this.axis[0]);

    move.multiplyScalar(moveDistance);
    target.object3D.position.add(move);

    console.log("Moving target by:", move);
  },
});

AFRAME.registerComponent("thumbstick-turn", {
  schema: {
    speed: {type: "number", default: 60}, // degrees per second
    rig: {type: "selector"}, // camera rig to rotate
  },

  init: function () {
    this.rotationInput = 0;

    this.el.addEventListener("axismove", (e) => {
      // axis[2] = X axis on right joystick (left/right)
      const turnValue = e.detail.axis[2];
      this.rotationInput = Math.abs(turnValue) > 0.1 ? turnValue : 0;
    });
  },

  tick: function (time, deltaTime) {
    if (!this.data.rig || this.rotationInput === 0) return;

    const angle = this.rotationInput * this.data.speed * (deltaTime / 1000);
    const rig = this.data.rig.object3D;
    rig.rotation.y -= THREE.MathUtils.degToRad(angle);
  },
});
