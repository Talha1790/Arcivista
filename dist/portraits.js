// Independent of the WebGL scene and global showcase pause state.
const portraitCards = [...document.querySelectorAll(".portrait-card")];
const portraitButton = document.querySelector("[data-portrait-motion]");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let portraitPaused = motionPreference.matches;
let explicitChoice = false;
const portraitStates = new Map();
function syncPortraits() {
  for (const [card, state] of portraitStates) {
    const playing = !portraitPaused && !document.hidden && state.visible;
    state.animations.forEach((animation) =>
      playing ? animation.play() : animation.pause(),
    );
    card.dataset.motionState = playing ? "playing" : "paused";
  }
  if (portraitButton) {
    portraitButton.textContent = portraitPaused
      ? "▶ Play portraits"
      : "Ⅱ Pause portraits";
    portraitButton.setAttribute("aria-pressed", String(portraitPaused));
  }
}
for (const card of portraitCards) {
  const photo = card.querySelector(".portrait-photo");
  if (!photo || typeof photo.animate !== "function") continue;
  const isBilal = card.classList.contains("bilal");
  const imageAnimation = photo.animate(
    [
      { transform: "translate3d(0,2px,0) scale(1)" },
      { transform: `translate3d(${isBilal ? 2 : -2}px,-5px,0) scale(1.055)` },
      { transform: "translate3d(0,2px,0) scale(1)" },
    ],
    {
      duration: isBilal ? 6500 : 7500,
      iterations: Infinity,
      easing: "ease-in-out",
    },
  );
  const frameAnimation = card
    .querySelector(".portrait-frame")
    .animate([{ opacity: 0.38 }, { opacity: 1 }, { opacity: 0.38 }], {
      duration: 5000,
      iterations: Infinity,
      easing: "ease-in-out",
    });
  const traceAnimation = card.querySelector(".portrait-trace").animate(
    [
      { transform: "translate3d(0,0,0)", opacity: 0.4 },
      { transform: "translate3d(0,260%,0)", opacity: 1 },
      { transform: "translate3d(0,0,0)", opacity: 0.4 },
    ],
    { duration: 6500, iterations: Infinity, easing: "ease-in-out" },
  );
  const lightAnimation = card.querySelector(".portrait-glint").animate(
    [
      { transform: "translate3d(-110%,0,0)", opacity: 0 },
      { offset: 0.45, transform: "translate3d(0,0,0)", opacity: 0.6 },
      { offset: 0.8, transform: "translate3d(110%,0,0)", opacity: 0 },
      { transform: "translate3d(110%,0,0)", opacity: 0 },
    ],
    { duration: 8500, iterations: Infinity, easing: "ease-in-out" },
  );
  const animations = [
    imageAnimation,
    frameAnimation,
    traceAnimation,
    lightAnimation,
  ];
  animations.forEach((animation) => animation.pause());
  portraitStates.set(card, { animations, visible: false });
}
if ("IntersectionObserver" in globalThis) {
  const portraitObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const state = portraitStates.get(entry.target);
        if (state) state.visible = entry.isIntersecting;
      });
      syncPortraits();
    },
    { threshold: 0, rootMargin: "30px 0px" },
  );
  portraitCards.forEach((card) => portraitObserver.observe(card));
} else {
  portraitStates.forEach((state) => (state.visible = true));
}
portraitButton?.addEventListener("click", () => {
  explicitChoice = true;
  portraitPaused = !portraitPaused;
  syncPortraits();
});
document.addEventListener("visibilitychange", syncPortraits);
motionPreference.addEventListener?.("change", (event) => {
  if (!explicitChoice) {
    portraitPaused = event.matches;
    syncPortraits();
  }
});
syncPortraits();
