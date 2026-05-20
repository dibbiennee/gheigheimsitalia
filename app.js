// ===== AUDIO ENGINE =====
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function beep(freq, dur = 0.08, type = "square", vol = 0.18) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function sweep(from, to, dur = 0.25, type = "sawtooth", vol = 0.18) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

function noise(dur = 0.18, vol = 0.22) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  src.buffer = buf;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(gain).connect(audioCtx.destination);
  src.start(t);
  src.stop(t + dur);
}

function fanfare() {
  beep(523, 0.09, "square", 0.18);
  setTimeout(() => beep(659, 0.09, "square", 0.18), 90);
  setTimeout(() => beep(784, 0.09, "square", 0.18), 180);
  setTimeout(() => beep(1046, 0.20, "square", 0.20), 270);
}

function failSound() {
  sweep(440, 80, 0.45, "sawtooth", 0.18);
}

// ===== PARTICLES =====
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let dpr = window.devicePixelRatio || 1;
function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = [];
const COLORS = ["#ff006e", "#00f0ff", "#ffd60a", "#b6f500", "#8338ec", "#fb5607"];

function burst(x, y, count = 24, palette = COLORS) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1,
      decay: 0.014 + Math.random() * 0.02,
      size: 4 + Math.random() * 6,
      color: palette[Math.floor(Math.random() * palette.length)],
      shape: Math.random() > 0.5 ? "rect" : "circle",
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
    });
  }
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.22;
    p.vx *= 0.985;
    p.life -= p.decay;
    p.rot += p.vr;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    if (p.shape === "rect") ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    else { ctx.beginPath(); ctx.arc(0, 0, p.size/2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  requestAnimationFrame(tick);
}
tick();

// ===== SHAKE =====
const shell = document.getElementById("shell");
function shake(hard = false) {
  shell.classList.remove("shake", "shake-hard");
  void shell.offsetWidth;
  shell.classList.add(hard ? "shake-hard" : "shake");
}

// ===== REACTION TEXT =====
const reactionEl = document.getElementById("reaction");
let reactionTimer = 0;
function reaction(text, color = "yellow") {
  reactionEl.textContent = text;
  reactionEl.style.color =
    color === "pink" ? "#ff006e"
    : color === "cyan" ? "#00f0ff"
    : color === "lime" ? "#b6f500"
    : "#ffd60a";
  reactionEl.classList.remove("show");
  void reactionEl.offsetWidth;
  reactionEl.classList.add("show");
  clearTimeout(reactionTimer);
  reactionTimer = setTimeout(() => reactionEl.classList.remove("show"), 1200);
}

const PHRASES_WIN  = ["BRAVISSIMO!", "MAMMA MIA!", "FORZA ITALIA!", "POMODORO!", "TROPPO FORTE!"];
const PHRASES_LOSE = ["PORCAMADO!", "MADONNA!", "PER LA MISERIA!", "PEGGIO DI ZIA PINA!", "AHIA!"];
const PHRASES_TIE  = ["UFFA!", "MEH.", "PARI!", "NIENTE!"];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ===== GLITCH RANDOMNESS =====
const brand = document.getElementById("brand");
setInterval(() => {
  if (Math.random() < 0.35) {
    brand.classList.add("glitch");
    setTimeout(() => brand.classList.remove("glitch"), 300);
  }
}, 4200);

// ===== COMBO =====
const comboEl = document.getElementById("combo");
let combo = 0;
function bumpCombo(by = 1) {
  combo += by;
  comboEl.textContent = combo;
  comboEl.classList.remove("bump");
  void comboEl.offsetWidth;
  comboEl.classList.add("bump");
  setTimeout(() => comboEl.classList.remove("bump"), 200);
}
function resetCombo() {
  combo = 0;
  comboEl.textContent = "0";
}

// ===== SCENE ROUTER =====
const scenes = document.querySelectorAll(".scene");
function goto(name) {
  scenes.forEach(s => s.classList.toggle("active", s.dataset.scene === name));
  if (window.location.hash !== "#" + name) window.location.hash = name;
  window.scrollTo(0, 0);
  ensureAudio();
}

document.querySelectorAll("[data-go]").forEach(btn => {
  btn.addEventListener("click", () => {
    ensureAudio();
    beep(880, 0.07);
    setTimeout(() => beep(1320, 0.10), 80);
    shake();
    const rect = btn.getBoundingClientRect();
    burst(rect.left + rect.width/2, rect.top + rect.height/2, 32);
    goto(btn.dataset.go);
  });
});

document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => {
    beep(440, 0.05);
    setTimeout(() => beep(330, 0.06), 50);
    goto("menu");
  });
});

document.getElementById("brand").addEventListener("click", () => goto("menu"));

// hash router on load
window.addEventListener("DOMContentLoaded", () => {
  const h = window.location.hash.replace("#", "");
  if (h && ["rps", "guess", "click"].includes(h)) goto(h);
});

// helper: bump score visual
function bumpEl(el) {
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 200);
}

// ===== GAME 1: RPS =====
const labels = { rock: "Sasso", paper: "Carta", scissors: "Forbice" };
const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
const opts = ["rock", "paper", "scissors"];

let rpsYou = 0, rpsCpu = 0;
const rpsYouEl = document.getElementById("rpsYou");
const rpsCpuEl = document.getElementById("rpsCpu");
const rpsRoundEl = document.getElementById("rpsRound");

document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    ensureAudio();
    if (rpsYou >= 5 || rpsCpu >= 5) return;
    const pickP = btn.dataset.pick;
    const cpuPick = opts[Math.floor(Math.random() * 3)];

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;

    if (pickP === cpuPick) {
      reaction(pick(PHRASES_TIE), "cyan");
      beep(440, 0.06);
      burst(cx, cy, 12, ["#00f0ff", "#ffffff"]);
      resetCombo();
    } else if (beats[pickP] === cpuPick) {
      rpsYou++;
      rpsYouEl.textContent = rpsYou;
      bumpEl(rpsYouEl);
      reaction(pick(PHRASES_WIN), "lime");
      fanfare();
      burst(cx, cy, 40, ["#b6f500", "#ffd60a", "#00f0ff"]);
      burst(window.innerWidth/2, window.innerHeight/2, 60);
      shake();
      bumpCombo();
    } else {
      rpsCpu++;
      rpsCpuEl.textContent = rpsCpu;
      bumpEl(rpsCpuEl);
      reaction(pick(PHRASES_LOSE), "pink");
      failSound();
      burst(cx, cy, 20, ["#ff006e", "#fb5607"]);
      shake(true);
      resetCombo();
    }

    rpsRoundEl.textContent = Math.min(rpsYou + rpsCpu + 1, 9);

    if (rpsYou === 5) {
      setTimeout(() => { reaction("MATCH TUO!", "lime"); fanfare(); burst(window.innerWidth/2, 200, 80); }, 700);
    }
    if (rpsCpu === 5) {
      setTimeout(() => { reaction("MACCHINA VINCE!", "pink"); failSound(); shake(true); }, 700);
    }
  });
});

document.querySelector("[data-reset='rps']").addEventListener("click", () => {
  rpsYou = 0; rpsCpu = 0;
  rpsYouEl.textContent = "0";
  rpsCpuEl.textContent = "0";
  rpsRoundEl.textContent = "1";
  beep(660, 0.08);
});

// ===== GAME 2: GUESS =====
let target = randomTarget();
let tries = 7, wins = 0, ended = false;
const guessTriesEl = document.getElementById("guessTries");
const guessWinsEl = document.getElementById("guessWins");
const guessLastEl = document.getElementById("guessLast");
const guessInput = document.getElementById("guessInput");

function randomTarget() { return Math.floor(Math.random() * 100) + 1; }

function guessSubmit() {
  ensureAudio();
  if (ended) return;
  const v = parseInt(guessInput.value, 10);
  if (Number.isNaN(v) || v < 1 || v > 100) {
    reaction("1—100!", "pink");
    failSound();
    shake();
    return;
  }

  guessLastEl.textContent = String(v).padStart(2, "0");
  bumpEl(guessLastEl);

  if (v === target) {
    wins++;
    guessWinsEl.textContent = wins;
    bumpEl(guessWinsEl);
    reaction("BRAVISSIMO!", "lime");
    fanfare();
    burst(window.innerWidth/2, window.innerHeight/2, 80);
    shake();
    bumpCombo(3);
    ended = true;
    return;
  }

  tries--;
  guessTriesEl.textContent = tries;

  if (tries === 0) {
    reaction(`ERA ${target}!`, "pink");
    failSound();
    shake(true);
    resetCombo();
    ended = true;
    return;
  }

  if (v < target) { reaction("PIÙ ALTO!", "cyan"); beep(660, 0.08); }
  else { reaction("PIÙ BASSO!", "yellow"); beep(330, 0.08); }
  bumpCombo();
  guessInput.select();
}

function guessReset() {
  target = randomTarget();
  tries = 7;
  ended = false;
  guessTriesEl.textContent = "7";
  guessLastEl.textContent = "—";
  guessInput.value = "";
  guessInput.focus();
  beep(880, 0.08);
}

document.getElementById("guessSubmit").addEventListener("click", guessSubmit);
document.querySelector("[data-reset='guess']").addEventListener("click", guessReset);
guessInput.addEventListener("keydown", e => { if (e.key === "Enter") guessSubmit(); });

// ===== GAME 3: CLICKER =====
const zone = document.getElementById("clickZone");
const clickTime = document.getElementById("clickTime");
const clickCount = document.getElementById("clickCount");
const clickBestEl = document.getElementById("clickBest");
const clickState = document.getElementById("clickState");
const clickSub = document.getElementById("clickSub");
const clickStartBtn = document.getElementById("clickStart");

const DURATION_MS = 10000;
const BEST_KEY = "gheigheims.clicker.best";

let running = false, count = 0, endsAt = 0, raf = 0;
let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
clickBestEl.textContent = best;

function tickClicker() {
  const remaining = Math.max(0, endsAt - performance.now());
  clickTime.textContent = (remaining / 1000).toFixed(1);
  if (remaining <= 0) { finishClicker(); return; }
  raf = requestAnimationFrame(tickClicker);
}

function startClicker() {
  ensureAudio();
  if (running) return;
  running = true;
  count = 0;
  clickCount.textContent = "0";
  clickState.textContent = "GO!";
  clickState.className = "clicker-state live";
  clickSub.textContent = "Clicca a manetta";
  zone.classList.remove("locked");
  zone.classList.add("live");
  endsAt = performance.now() + DURATION_MS;
  clickTime.textContent = (DURATION_MS / 1000).toFixed(1);
  raf = requestAnimationFrame(tickClicker);
  sweep(220, 880, 0.35);
  reaction("VAI!", "lime");
  resetCombo();
}

function finishClicker() {
  running = false;
  cancelAnimationFrame(raf);
  clickTime.textContent = "0.0";
  clickState.textContent = "STOP";
  clickState.className = "clicker-state over";
  clickSub.textContent = `${count} click totali`;
  zone.classList.add("locked");
  zone.classList.remove("live");

  const cps = (count / (DURATION_MS / 1000)).toFixed(1);
  let recordMsg = "";
  if (count > best) {
    best = count;
    localStorage.setItem(BEST_KEY, String(best));
    clickBestEl.textContent = best;
    bumpEl(clickBestEl);
    recordMsg = "NUOVO RECORD!";
  }

  if (count > 0) {
    setTimeout(() => {
      reaction(recordMsg || `${count} CLICK!`, recordMsg ? "lime" : "yellow");
      if (recordMsg) fanfare();
      burst(window.innerWidth/2, window.innerHeight/2, 100);
      shake(true);
    }, 200);
  } else {
    failSound();
    reaction("ZERO?!", "pink");
  }

  clickSub.textContent = `${count} click · ${cps} click/sec` + (recordMsg ? " · record battuto" : "");
}

zone.addEventListener("click", (e) => {
  if (!running) return;
  count++;
  clickCount.textContent = count;
  bumpCombo();

  const rect = zone.getBoundingClientRect();
  const lx = e.clientX - rect.left;
  const ly = e.clientY - rect.top;
  const fx = document.createElement("span");
  fx.className = "fx-plus";
  const colors = ["#ff006e", "#00f0ff", "#ffd60a", "#b6f500"];
  fx.style.color = colors[count % colors.length];
  fx.style.left = lx + "px";
  fx.style.top = ly + "px";
  fx.style.setProperty("--rot", (Math.random() * 30 - 15) + "deg");
  fx.textContent = "+1";
  zone.appendChild(fx);
  setTimeout(() => fx.remove(), 900);

  burst(e.clientX, e.clientY, 6, colors);
  beep(440 + (count % 8) * 80, 0.04, "square", 0.12);

  if (count > 0 && count % 25 === 0) {
    reaction(pick(PHRASES_WIN), "lime");
    burst(e.clientX, e.clientY, 40);
    shake();
  }
});

clickStartBtn.addEventListener("click", startClicker);
document.querySelector("[data-reset='click']").addEventListener("click", () => {
  localStorage.removeItem(BEST_KEY);
  best = 0;
  clickBestEl.textContent = "0";
  reaction("RECORD AZZERATO", "cyan");
  beep(220, 0.18, "sawtooth");
});

// ===== INTRO BLAST =====
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    burst(window.innerWidth/2, window.innerHeight/3, 40);
    burst(window.innerWidth/4, window.innerHeight/2, 25);
    burst(window.innerWidth*3/4, window.innerHeight/2, 25);
  }, 400);
});

// First-tap sound primer (some browsers block audio until interaction)
document.body.addEventListener("pointerdown", function primer() {
  ensureAudio();
  document.body.removeEventListener("pointerdown", primer);
}, { once: false });
