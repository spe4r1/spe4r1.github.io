(() => {
  "use strict";

  const root = document.documentElement;
  const dialog = document.getElementById("entrance");
  const canvas = dialog.querySelector("canvas");
  const context = canvas.getContext("2d");
  const sculpture = document.querySelector(".sculpture");
  const replay = document.getElementById("replay-entry");
  const skip = document.getElementById("skip-entry");
  const chrome = dialog.querySelector(".entry-chrome");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const autoplay = !location.hash || location.hash === "#top";
  if (!context || typeof dialog.showModal !== "function") {
    root.classList.remove("entry-pending");
    return;
  }

  const TAU = Math.PI * 2;
  const duration = 4250;
  const samples = 48;
  const ringCount = 144;
  const mix = (a, b, t) => a + (b - a) * t;
  function ease(from, to, value) {
    const t = Math.max(0, Math.min(1, (value - from) / (to - from)));
    return t * t * (3 - 2 * t);
  }

  // Each long opening strand rolls into one cross-section of the hero sculpture.
  function makeRing(index) {
    const fraction = index / ringCount;
    const t = fraction * TAU;
    const radial = 1.46 + .66 * Math.cos(3 * t);
    const radialSlope = -1.98 * Math.sin(3 * t);
    const x = radial * Math.cos(2 * t);
    const y = radial * Math.sin(2 * t);
    const z = .86 * Math.sin(3 * t);
    const dx = radialSlope * Math.cos(2 * t) - 2 * radial * Math.sin(2 * t);
    const dy = radialSlope * Math.sin(2 * t) + 2 * radial * Math.cos(2 * t);
    const dz = 2.58 * Math.cos(3 * t);
    const length = Math.hypot(dx, dy, dz);
    const flatLength = Math.hypot(dx, dy);
    const ux = dy / flatLength, uy = -dx / flatLength;
    const vx = -dz * uy / length, vy = dz * ux / length, vz = -flatLength / length;
    const model = new Float32Array((samples + 1) * 3);
    for (let j = 0; j <= samples; j++) {
      const angle = TAU * j / samples;
      const cos = .505 * Math.cos(angle), sin = .505 * Math.sin(angle);
      model.set([x + cos * ux + sin * vx, y + cos * uy + sin * vy, z + sin * vz], j * 3);
    }
    return { index, fraction, model, screen: new Float32Array((samples + 1) * 2), depth: 0 };
  }

  // Rotation and lens match the camera used for the static knot artwork.
  function camera(pitch, yaw, roll) {
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cz = Math.cos(roll), sz = Math.sin(roll);
    return [
      cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
      sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
      -sy, cy * sx, cy * cx
    ];
  }

  const rings = Array.from({ length: ringCount }, (_, index) => makeRing(index));
  const depthOrder = rings.slice();
  const rest = camera(.45, -.38, -.33);
  function restBounds() {
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    for (const { model } of rings) {
      for (let k = 0; k < model.length; k += 3) {
        const x = model[k], y = model[k + 1], z = model[k + 2];
        const lens = 9 / (9 - (rest[6] * x + rest[7] * y + rest[8] * z));
        const px = (rest[0] * x + rest[1] * y + rest[2] * z) * lens;
        const py = -(rest[3] * x + rest[4] * y + rest[5] * z) * lens;
        left = Math.min(left, px); right = Math.max(right, px);
        top = Math.min(top, py); bottom = Math.max(bottom, py);
      }
    }
    return { x: (left + right) / 2, y: (top + bottom) / 2, height: bottom - top };
  }
  const bounds = restBounds();
  let width, height, target, glow;
  let frame = 0, fallback = 0, started = 0;
  let active = false, gentle = false;

  function measure() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const rect = sculpture.getBoundingClientRect();
    const aspect = (sculpture.naturalWidth || 1204) / (sculpture.naturalHeight || 1250);
    target = {
      x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
      height: Math.min(sculpture.clientHeight, sculpture.clientWidth / aspect), aspect
    };
    glow = context.createRadialGradient(width * .48, height * .46, 0, width * .48, height * .46, Math.max(width, height) * .56);
    glow.addColorStop(0, "#171b22"); glow.addColorStop(.6, "#0c0e12"); glow.addColorStop(1, "#090a0c");
  }

  function projectStrands(time, pose) {
    const turn = 1 - ease(.14, .70, time);
    const rotation = camera(.45 + .52 * turn, -.38 - 1.7 * turn, -.33 + .38 * turn);
    const cos = Math.cos(pose.angle), sin = Math.sin(pose.angle);
    const scale = pose.size * .987 / bounds.height;
    for (const ring of rings) {
      const { fraction, model, screen } = ring;
      const delay = .13 * fraction;
      const gather = ease(.075 + delay, .51 + delay, time);
      const wavePhase = fraction * 3.6 - time * 3.7;
      let depth = 0;
      for (let j = 0; j <= samples; j++) {
        const k = j * 3;
        const x = model[k], y = model[k + 1], z = model[k + 2];
        const rz = rotation[6] * x + rotation[7] * y + rotation[8] * z;
        const lens = 9 / (9 - rz);
        const px = ((rotation[0] * x + rotation[1] * y + rotation[2] * z) * lens - bounds.x) * scale;
        const py = (-(rotation[3] * x + rotation[4] * y + rotation[5] * z) * lens - bounds.y) * scale;
        const u = j / samples;
        // Keep a full-bleed, folded ribbon in the very first painted frame.
        const ribbonX = width * (1.48 * u - .24 + .043 * Math.cos(8 * u + wavePhase));
        const ribbonY = height * (.50 + .18 * Math.sin(7.6 * u + wavePhase)
          + .13 * Math.cos(4.4 * u - wavePhase * .82) - .23 * (u - .5) + .12 * (fraction - .5));
        screen[j * 2] = mix(ribbonX, pose.x + cos * px - sin * py, gather);
        screen[j * 2 + 1] = mix(ribbonY, pose.y + sin * px + cos * py, gather);
        depth += rz;
      }
      ring.depth = depth / (samples + 1);
    }
  }

  function drawStrands(time, opacity) {
    depthOrder.sort((a, b) => a.depth - b.depth);
    const folded = ease(.39, .66, time);
    const highlights = .82 + .18 * Math.sin(time * 15);
    context.lineJoin = "round";
    for (const ring of depthOrder) {
      const { screen, fraction, index, depth } = ring;
      const front = Math.min(1, Math.max(0, (depth + 2.5) / 5));
      const sheen = .5 + .5 * Math.sin(fraction * 15 - time * 9);
      context.beginPath();
      context.moveTo(screen[0], screen[1]);
      for (let j = 1; j <= samples; j++) context.lineTo(screen[2 * j], screen[2 * j + 1]);
      if (folded > 0) {
        context.fillStyle = "rgba(11,14,19," + folded * .65 * opacity + ")";
        context.fill();
      }
      context.strokeStyle = sheen > .73 ? "#f2f4ff" : "#a5bbd8";
      context.globalAlpha = opacity * (.16 + .39 * sheen + .32 * front) * highlights;
      context.lineWidth = .65 + .56 * front;
      context.stroke();
      // Pulses travel on the filaments themselves, so their depth reads during the turn.
      if (index % 3 === 0) {
        const spot = ((fraction * 1.7 + time * .61) % 1) * samples;
        const j = Math.floor(spot) * 2, blend = spot % 1;
        const x = mix(screen[j], screen[j + 2], blend);
        const y = mix(screen[j + 1], screen[j + 3], blend);
        context.globalAlpha = opacity * (.38 + front * .48);
        context.fillStyle = "#e0efff";
        context.beginPath(); context.arc(x, y, .75 + front * .8, 0, TAU); context.fill();
      }
      context.globalAlpha = 1;
    }
  }

  function paint(time) {
    const dock = ease(.62, .985, time);
    const reveal = ease(.65, .925, time);
    const metal = sculpture.complete && sculpture.naturalWidth ? ease(.51, .78, time) : 0;
    const pose = {
      x: mix(width * .5, target.x, dock), y: mix(height * .48, target.y, dock),
      size: mix(Math.min(width * .86, height * .75), target.height, dock),
      angle: mix(-.33, -64 * Math.PI / 180, ease(.29, .84, time))
    };
    context.clearRect(0, 0, width, height);
    context.globalAlpha = 1 - reveal;
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    context.globalAlpha = 1;
    if (metal > 0) {
      context.save();
      context.globalAlpha = metal;
      context.translate(pose.x, pose.y);
      context.rotate(pose.angle);
      const imageWidth = pose.size * target.aspect;
      context.drawImage(sculpture, -imageWidth / 2, -pose.size / 2, imageWidth, pose.size);
      context.restore();
    }
    if (metal < 1) {
      projectStrands(time, pose);
      drawStrands(time, 1 - metal);
    }
    if (time >= .65) root.classList.add("entry-docking");
  }

  // Preserve the visual opening without camera travel when reduced motion is preferred.
  function paintGentle(time) {
    const fade = 1 - ease(.67, 1, time);
    const folded = ease(.17, .59, time);
    const pose = { x: width / 2, y: height * .48, size: Math.min(width * .80, height * .72), angle: -64 * Math.PI / 180 };
    context.clearRect(0, 0, width, height);
    context.globalAlpha = fade;
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    context.globalAlpha = 1;
    if (folded < 1) {
      projectStrands(.045, pose);
      drawStrands(time * .12, (1 - folded) * fade);
    }
    if (folded > 0) {
      projectStrands(.78, pose);
      drawStrands(.78, folded * fade);
    }
  }

  function finish() {
    if (!active) return;
    active = false;
    cancelAnimationFrame(frame);
    clearTimeout(fallback);
    window.removeEventListener("resize", measure);
    root.classList.remove("entry-playing", "entry-gentle", "entry-docking", "entry-pending");
    dialog.close();
    // Release the full-screen backing store between plays.
    canvas.width = canvas.height = 1;
  }
  function tick(now) {
    const time = Math.min(1, (now - started) / (gentle ? 2750 : duration));
    if (time >= 1) { finish(); return; }
    if (gentle) paintGentle(time);
    else paint(time);
    chrome.style.opacity = String(1 - ease(.62, .83, time));
    chrome.style.setProperty("--entry-time", time);
    frame = requestAnimationFrame(tick);
  }
  function play(reduced) {
    if (active) return;
    active = true;
    gentle = reduced;
    fallback = setTimeout(finish, duration + 800);
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
      dialog.showModal();
      root.classList.add("entry-playing");
      root.classList.toggle("entry-gentle", gentle);
      root.classList.remove("entry-pending");
      measure();
      window.addEventListener("resize", measure);
      started = performance.now();
      tick(started);
    } catch {
      finish();
    }
  }
  skip.addEventListener("click", finish);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(); });
  motion.addEventListener("change", () => { if (motion.matches) finish(); });
  window.addEventListener("pagehide", finish);
  replay.hidden = false;
  replay.addEventListener("click", () => play(false));
  if (autoplay && performance.getEntriesByType("navigation")[0]?.type !== "back_forward") {
    const explicitPlayback = new URLSearchParams(location.search).get("intro") === "play";
    play(motion.matches && !explicitPlayback);
  } else root.classList.remove("entry-pending");
})();
