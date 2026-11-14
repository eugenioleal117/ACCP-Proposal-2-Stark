const page = document.documentElement;
const mode = document.querySelector('#theme');
const menu = document.querySelector('#menu-button');
const navigation = document.querySelector('#navigation');

function setTheme(value) {
  page.dataset.theme = value;
  const light = value === 'light';
  mode.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  mode.querySelector('use').setAttribute('href', light ? '#moon' : '#sun');
}
try {
  if (localStorage.getItem('accp-concept-02-theme') === 'light') setTheme('light');
} catch {}
mode.addEventListener('click', () => {
  setTheme(page.dataset.theme === 'dark' ? 'light' : 'dark');
  try { localStorage.setItem('accp-concept-02-theme', page.dataset.theme); } catch {}
});

function setMenu(open) {
  navigation.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}
menu.addEventListener('click', () => setMenu(!navigation.classList.contains('open')));
navigation.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navigation.classList.contains('open')) {
    setMenu(false);
    menu.focus();
  }
});

const canvas = document.querySelector('#structure');
const context = canvas.getContext('2d');
function drawBlueprint() {
  const {width, height} = canvas.getBoundingClientRect();
  if (!width || !height || !context) return;
  const scale = Math.min(devicePixelRatio, 2);
  canvas.width = width * scale;
  canvas.height = height * scale;
  context.setTransform(canvas.width / 600, 0, 0, canvas.height / 450, 0, 0);
  const line = (points, color, size = 1) => {
    context.beginPath();
    for (const [index,[x,y]] of points.entries()) {
      if (index === 0) context.moveTo(x,y);
      else context.lineTo(x,y);
    }
    context.lineWidth = size;
    context.strokeStyle = color;
    context.stroke();
  };
  const glow = context.createRadialGradient(315,224,12,315,224,280);
  glow.addColorStop(0,'#24174b');
  glow.addColorStop(1,'#0b0c15');
  context.fillStyle = glow;
  context.fillRect(0,0,600,450);
  for (let x = 0; x < 600; x += 24) line([[x,0],[x,450]],'#d2c7ff12');
  for (let y = 0; y < 450; y += 24) line([[0,y],[600,y]],'#d2c7ff12');
  let seed = 4127;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 850; i++) {
    const x = 42 + random() * 515;
    const y = 45 + random() * 330;
    const opacity = 0.10 + random() * 0.26;
    context.fillStyle = i % 19 === 0 ? 'rgba(255,184,41,.55)' : 'rgba(163,130,255,'+opacity+')';
    const radius = i % 19 === 0 ? 1.7 : 1;
    context.fillRect(x,y,radius,radius);
  }
  const point = (x,y,z) => [121+x+z*.55,327-y-z*.30];
  const segment = (a,b,color,size) => line([point(...a),point(...b)],color,size);
  const steel='#b999ff';
  for (const z of [0,100,180]) {
    for (const x of [0,72,144,216,288]) segment([x,0,z],[x,150,z],steel,1.4);
    for (const y of [0,8,144,157]) segment([0,y,z],[288,y,z],steel,1.35);
  }
  for (const x of [0,72,144,216,288]) {
    for (const y of [0,8,144,157]) segment([x,y,0],[x,y,180],steel,1.35);
    segment([x,0,0],[x,144,100],'#906cfa83',1);
  }
  for (const x of [36,108,180,252]) segment([x,8,0],[x,144,0],'#815fe5a3',1);
  line([[110,349],[409,349],[516,290]],'#ffb829',1.4);
  line([[121,342],[121,356]],'#ffb829');
  line([[409,342],[409,356]],'#ffb829');
  context.font='12px Plex, monospace';
  context.fillStyle='#ffca6c';
  context.fillText('FRONT ELEVATION',119,373);
  context.fillText('STEEL FRAME',391,107);
  line([[390,115],[371,133],[371,163]],'#ffb829',1);
}
new ResizeObserver(drawBlueprint).observe(canvas);
drawBlueprint();

const views = [...document.querySelectorAll('[data-view]')];
for (const control of views) {
  control.addEventListener('click', () => {
    const built = control.dataset.view === 'built';
    document.querySelector('.drawing').classList.toggle('built', built);
    document.querySelector('#view-label').textContent = built ? 'Architectural concept' : 'Structural elevation';
    canvas.setAttribute('aria-hidden', String(built));
    document.querySelector('#built').setAttribute('aria-hidden', String(!built));
    for (const item of views) item.setAttribute('aria-pressed', String(item === control));
  });
}

for (const swatch of document.querySelectorAll('[data-color]')) {
  swatch.addEventListener('click', async () => {
    const status = document.querySelector('#color-status');
    try {
      await navigator.clipboard.writeText(swatch.dataset.color);
      status.textContent = 'Copied ' + swatch.dataset.color + '.';
    } catch {
      status.textContent = 'Hex code: ' + swatch.dataset.color;
    }
  });
}

document.querySelector('#quote-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#form-status').textContent = 'Request preview complete. No information was sent.';
});
