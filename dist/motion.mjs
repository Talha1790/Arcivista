export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const ease = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };
export const range = (v, start, end) => ease((v - start) / (end - start));
export const damp = (current, target, rate, dt) => target + (current - target) * Math.exp(-rate * dt);
export function scrollState(p, mobile = false) {
  p = clamp(p);
  const enter = range(p, .10, .46), leave = range(p, .57, .92);
  return {
    x: mobile ? 0 : 3.65 * (1 - enter) + 3.45 * leave,
    y: mobile ? -.08 : -.10 - .70 * enter + .60 * leave,
    yaw: -.20 + .20 * enter + .20 * leave,
    pitch: .035 - .045 * enter + .025 * leave,
    scale: 1 + .04 * enter - .08 * leave,
    hero: 1 - range(p, .08, .27),
    middle: range(p, .29, .43) * (1 - range(p, .56, .68)),
    final: range(p, .70, .85),
    chapter: p < .3 ? 1 : p < .7 ? 2 : 3
  };
}
