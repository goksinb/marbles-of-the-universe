document.addEventListener("DOMContentLoaded", () => {
  const marbleCount = 5;
  let current = 1;

  const enableMarble = (i) => {
    const marble = document.querySelector(`#marble${i}`);
    if (!marble) return;

    marble.classList.add("clickable");

    // ✅ Refresh raycaster targets
    const scene = document.querySelector("a-scene");
    if (scene?.components?.raycaster) {
      scene.components.raycaster.refreshObjects();
    }

    const sphere = marble.querySelector(`#marble${i}-sphere`);
    if (sphere) {
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
        marble.classList.remove("clickable");
        sphere?.removeAttribute("animation__pulse");
        sphere?.setAttribute("visible", false);

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

        if (i === marbleCount) {
          const island = document.querySelector("#goksin-island-entity");
          if (island) {
            island.setAttribute("visible", true);
            island.setAttribute("opacity", "0");
            island.setAttribute("animation__fadein", {
              property: "opacity",
              to: 1,
              dur: 2000,
              easing: "easeInOutQuad",
              startEvents: "startFadeIn",
            });
            island.emit("startFadeIn");
            island.classList.add("clickable");

            // Refresh raycaster again for the island
            if (scene?.components?.raycaster) {
              scene.components.raycaster.refreshObjects();
            }
          }
        } else {
          current++;
          // ✅ Use delay + requestAnimationFrame to prevent instant re-click
          setTimeout(() => {
            requestAnimationFrame(() => enableMarble(current));
          }, 50);
        }
      },
      {once: true}
    );
  };

  enableMarble(current);
});

AFRAME.registerComponent("island-link", {
  init: function () {
    this.el.addEventListener("click", () => {
      console.log("Island hitbox clicked!");
      window.location.href = "island.html";
    });
  },
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
    speed: {type: "number", default: 60},
    rig: {type: "selector"},
  },

  init: function () {
    this.rotationInput = 0;

    this.el.addEventListener("axismove", (e) => {
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
