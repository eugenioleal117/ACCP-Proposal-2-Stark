const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const themeButton = document.querySelector(".theme-button");
const menuButton = document.querySelector(".mobile-menu");
const navigation = document.querySelector("#navigation");

function updateTheme(theme) {
  const light = theme === "light";
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = light ? "#ffffff" : "#000000";
  themeButton.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
  themeButton.querySelector("use").setAttribute("href", light ? "#moon" : "#sun");
}

try {
  updateTheme(localStorage.getItem("accp-proposal-02-theme") === "light" ? "light" : "dark");
} catch {
  updateTheme("dark");
}
themeButton.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  updateTheme(next);
  try { localStorage.setItem("accp-proposal-02-theme", next); } catch {}
});

function showNavigation(open) {
  navigation.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}
menuButton.addEventListener("click", () => showNavigation(!navigation.classList.contains("open")));
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) showNavigation(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    showNavigation(false);
    menuButton.focus();
  }
});

const finishes = {
  spectrum: ["Violet and teal framed by a bright silver edge for dark digital surfaces.", "Original ACCP skyline shape in a violet, silver and teal gradient"],
  silver: ["A metallic gradient for print, signage and hardware.", "ACCP skyline logo with a brushed silver gradient"],
  solid: ["A single-color mark for small applications and restricted printing.", "ACCP skyline logo in one high-contrast color"],
  original: ["The existing full-color ACCP Construction logo.", "Original blue and white ACCP Construction artwork"],
};
const finishStage = document.querySelector("#finish-image");
const finishButtons = document.querySelectorAll("button[data-finish]");
finishButtons.forEach((button) => button.addEventListener("click", () => {
  const key = button.dataset.finish;
  const [caption, description] = finishes[key];
  finishStage.dataset.finish = key;
  finishStage.setAttribute("aria-label", description);
  document.querySelector("#finish-caption").textContent = caption;
  finishButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
}));

const galleryButtons = document.querySelectorAll("[data-show]");
galleryButtons.forEach((button) => button.addEventListener("click", () => {
  galleryButtons.forEach((item) => {
    const selected = item === button;
    const slide = document.getElementById(item.dataset.show);
    slide.hidden = !selected;
    slide.classList.toggle("enter", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
}));

const form = document.querySelector("form");
const formStatus = document.querySelector("#form-status");
function previewRequest(event) {
  event.preventDefault();
  formStatus.textContent = "";
  if (form.reportValidity()) {
    const projectType = form.querySelector("select").value;
    formStatus.textContent = `Preview ready for your ${projectType.toLowerCase()} project. No information was sent.`;
  }
}
form.addEventListener("submit", previewRequest);
form.addEventListener("input", () => { formStatus.textContent = ""; });
document.querySelector("#preview-request").addEventListener("click", previewRequest);

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach(({ target }) => {
      target.classList.add("visible");
      revealObserver.unobserve(target);
    });
  }, { threshold: 0.08 });
  root.classList.add("can-reveal");
  document.querySelectorAll(".rise").forEach((item) => revealObserver.observe(item));
}

const canvas = document.querySelector("#constellation");
const motionButton = document.querySelector("#motion");
const viewButton = document.querySelector("#change-view");
const context = canvas.getContext("2d");

if (context) {
  startConstellation();
} else {
  motionButton.hidden = true;
  viewButton.hidden = true;
}

function startConstellation() {
  let seed = 491039;
  function random() {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  const particles = [];
  const ambient = [];
  const darkInks = ["#a47dff", "#8052ff", "#d7b6ff", "#ffb829", "#45e0bd", "#6c9cff", "#f27bce", "#e6e1ff"];
  const lightInks = ["#6030c8", "#7042e1", "#7a4eaa", "#995200", "#0c7768", "#315ca8", "#9b357e", "#655782"];

  function addPoint(x, y, z, weight) {
    const colorRoll = random();
    const ink = colorRoll < .34 ? 0 : colorRoll < .57 ? 1 : colorRoll < .66 ? 2 :
      colorRoll < .75 ? 3 : colorRoll < .82 ? 4 : colorRoll < .9 ? 5 : colorRoll < .96 ? 6 : 7;
    particles.push({
      x, y, z, weight, ink,
      size: .43 + random() * 1.12,
      phase: random() * Math.PI * 2,
      offsetX: (random() - .5) * 4.8,
      offsetY: (random() - .5) * 3.2,
      offsetZ: (random() - .5) * 3.2,
    });
  }

  function surface(count, x0, x1, y0, y1, z0, z1, weight) {
    for (let i = 0; i < count; i++) {
      addPoint(x0 + random() * (x1 - x0), y0 + random() * (y1 - y0), z0 + random() * (z1 - z0), weight);
    }
  }

  function line(a, b, count, weight) {
    for (let i = 0; i < count; i++) {
      const fraction = random();
      addPoint(...a.map((start, axis) => start + (b[axis] - start) * fraction + (random() - .5) * .045), weight);
    }
  }

  function slab(x0, x1, y, z0, z1, count) {
    surface(count, x0, x1, y - .035, y + .035, z0, z1, .57);
    const corners = [[x0,y,z0], [x1,y,z0], [x1,y,z1], [x0,y,z1]];
    corners.forEach((corner, index) => line(corner, corners[(index + 1) % corners.length], 53, .93));
  }

  // Three staggered plates and a recessed glass enclosure form the pavilion.
  slab(-2.72, 2.76, 1.45, -1.46, 1.11, 560);
  slab(-2.13, 2.67, .35, -.98, 1.08, 385);
  slab(-2.74, 2.85, -.75, -1.2, 1.33, 320);
  surface(285, -1.9, 2.17, -.72, 1.42, .94, .94, .48);
  surface(180, 2.16, 2.16, -.72, 1.42, -.9, .94, .51);
  surface(170, -1.88, 2.16, -.73, -.1, -.9, -.9, .45);
  for (const x of [-1.91, -1.15, -.4, .37, 1.12, 2.15]) {
    line([x,-.74,.94], [x,1.45,.94], 37, .81);
  }
  for (const z of [-.92, -.25, .35, .94]) {
    line([2.15,-.74,z], [2.15,1.45,z], 29, .76);
  }
  for (let i = 0; i < 150; i++) {
    ambient.push({
      x: random(), y: random(), size: .37 + random() * .72, phase: random() * Math.PI * 2,
      ink: Math.floor(random() * darkInks.length),
    });
  }

  let width = 0;
  let height = 0;
  let frame = 0;
  let lastTime = 0;
  let lastPaint = -Infinity;
  let elapsed = 0;
  let elevationBlend = 0;
  let elevation = false;
  let paused = reducedMotion.matches;
  let visible = true;
  let cursorX = 0;
  let cursorY = 0;
  let easedX = 0;
  let easedY = 0;
  const phaseStep = Math.PI * 2 / 3;
  function triangle(path, x, y, r, angle) {
    path.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    path.lineTo(x + Math.cos(angle + phaseStep) * r, y + Math.sin(angle + phaseStep) * r);
    path.lineTo(x + Math.cos(angle + 2 * phaseStep) * r, y + Math.sin(angle + 2 * phaseStep) * r);
    path.closePath();
  }

  function paint(staticFrame = false) {
    if (!width || !height) return;
    const inks = root.dataset.theme === "light" ? lightInks : darkInks;
    context.clearRect(0, 0, width, height);
    const time = elapsed / 1000;
    const intro = staticFrame ? 1 : Math.min(1, elapsed / 1500);
    const scatter = (1 - intro) ** 3;
    const scale = Math.min(width / 6.8, height / 4.85);
    const pitch = (.36 + easedY * .15) * (1 - elevationBlend);
    const yaw = (-.46 + Math.sin(time * .24) * .11 + easedX * .29) * (1 - elevationBlend);
    const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
    const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
    const buckets = darkInks.map(() => [new Path2D(), new Path2D(), new Path2D(), new Path2D()]);

    for (const point of ambient) {
      const drift = Math.sin(time * .24 + point.phase);
      triangle(buckets[point.ink][0], point.x * width + drift * 5, point.y * height + drift * 6,
        point.size, point.phase + time * .04);
    }

    for (const point of particles) {
      const flicker = Math.sin(time * 1.15 + point.phase + point.x * .6);
      const drift = .018 * flicker;
      const x = point.x + point.offsetX * scatter + drift;
      const y = point.y - .26 + point.offsetY * scatter + drift;
      const z = point.z + point.offsetZ * scatter;
      const across = x * cosY - z * sinY;
      const depth = x * sinY + z * cosY;
      const vertical = y * cosP - depth * sinP;
      const perspective = 1 + depth * .063 * (1 - elevationBlend);
      const brightness = point.weight + flicker * .18 + depth * .043;
      const bucket = brightness > .83 ? 3 : brightness > .52 ? 2 : 1;
      triangle(buckets[point.ink][bucket], width * .5 + across * scale * perspective,
        height * .49 - vertical * scale * perspective, point.size * (.86 + .14 * perspective),
        point.phase + time * .05);
    }

    const alphas = root.dataset.theme === "light" ? [.25, .32, .61, .88] : [.32, .38, .71, .99];
    inks.forEach((color, index) => {
      context.strokeStyle = color;
      alphas.forEach((alpha, level) => {
        context.globalAlpha = alpha;
        context.lineWidth = level > 1 ? .9 : .65;
        context.stroke(buckets[index][level]);
      });
    });
    context.globalAlpha = 1;
  }

  function tick(timestamp) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    elapsed += lastTime ? Math.min(45, timestamp - lastTime) : 0;
    lastTime = timestamp;
    if (timestamp - lastPaint >= 31) {
      elevationBlend += ((elevation ? 1 : 0) - elevationBlend) * .13;
      easedX += (cursorX - easedX) * .1;
      easedY += (cursorY - easedY) * .1;
      paint();
      lastPaint = timestamp;
    }
    frame = requestAnimationFrame(tick);
  }

  function syncMotion() {
    motionButton.textContent = paused ? "Play motion" : "Pause motion";
    motionButton.setAttribute("aria-pressed", String(paused));
    if (paused || !visible || document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (paused) paint(true);
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
  }

  new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    paint(true);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  }).observe(canvas);
  document.addEventListener("visibilitychange", syncMotion);
  reducedMotion.addEventListener("change", () => {
    paused = reducedMotion.matches;
    if (paused) root.classList.remove("can-reveal");
    syncMotion();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const bounds = canvas.getBoundingClientRect();
    cursorX = (event.clientX - bounds.left) / bounds.width - .5;
    cursorY = (event.clientY - bounds.top) / bounds.height - .5;
  });
  canvas.addEventListener("pointerleave", () => { cursorX = 0; cursorY = 0; });
  motionButton.addEventListener("click", () => {
    paused = !paused;
    if (paused) elapsed = Math.max(1500, elapsed);
    syncMotion();
  });
  viewButton.addEventListener("click", () => {
    elevation = !elevation;
    viewButton.textContent = elevation ? "Perspective view" : "Elevation view";
    viewButton.setAttribute("aria-pressed", String(elevation));
    document.querySelector("#view-label").textContent = elevation ? "Front elevation" : "Pavilion in perspective";
    if (paused) {
      elevationBlend = elevation ? 1 : 0;
      paint(true);
    }
  });
  themeButton.addEventListener("click", () => { if (paused) paint(true); });
  syncMotion();
}
