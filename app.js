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

function fanfare() {
  beep(523, 0.09, "square", 0.18);
  setTimeout(() => beep(659, 0.09, "square", 0.18), 90);
  setTimeout(() => beep(784, 0.09, "square", 0.18), 180);
  setTimeout(() => beep(1046, 0.20, "square", 0.20), 270);
}

function failSound() {
  sweep(440, 80, 0.45, "sawtooth", 0.18);
}

// ===== TTS ITALIANO (Brainrot voice) =====
let ttsVoice = null;
function pickItalianVoice() {
  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];
  ttsVoice = voices.find(v => v.lang === "it-IT") || voices.find(v => v.lang && v.lang.startsWith("it")) || null;
}
if (window.speechSynthesis) {
  pickItalianVoice();
  speechSynthesis.addEventListener("voiceschanged", pickItalianVoice);
}

function tts(text, rate = 1.25, pitch = 1.1) {
  if (!window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (ttsVoice) u.voice = ttsVoice;
    u.lang = "it-IT";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 0.8;
    speechSynthesis.speak(u);
  } catch (e) { /* silent */ }
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

function tickFx() {
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
  requestAnimationFrame(tickFx);
}
tickFx();

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

const BRAINROT_WIN = ["TRALALERO TRALALA!", "BOMBARDIRO!", "SAHUR SAHUR!", "BRAVISSIMO!", "MAMMA MIA!"];
const BRAINROT_LOSE = ["PORCAMADO!", "MADONNA!", "OH NO!", "AHIA!", "PEGGIO DI ZIA PINA!"];
const BRAINROT_TIE  = ["UFFA!", "MEH.", "PARI."];

const TTS_WIN  = ["Tralalero tralala", "Bombardiro coccodrillo", "Tung tung sahur", "Bravissimo", "Mamma mia"];
const TTS_LOSE = ["Porcamado", "Mamma mia che disastro", "Ahia", "Tung tung", "Sahur sahur"];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ===== TOAST =====
const toastEl = document.getElementById("toast");
let toastTimer = 0;
function toast(msg, ms = 2400) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.hidden = true, ms);
}

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
  if (name === "leaderboard") loadLeaderboard(currentLbGame);
  if (name === "guess") initGuessScene();
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

window.addEventListener("DOMContentLoaded", () => {
  const h = window.location.hash.replace("#", "");
  if (h && ["rps", "guess", "click", "leaderboard"].includes(h)) goto(h);
});

function bumpEl(el) {
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 200);
}

// ===== SHARE =====
const SITE_URL = "https://gheigheimsitalia.vercel.app";

async function share(text) {
  try {
    if (navigator.share) {
      await navigator.share({ text, url: SITE_URL });
      return;
    }
  } catch (e) { /* fallback */ }
  try {
    await navigator.clipboard.writeText(text + "\n" + SITE_URL);
    toast("Copiato negli appunti");
  } catch {
    toast("Copia manualmente: " + text);
  }
}

// ===== NICKNAME MODAL =====
const nickModal = document.getElementById("nickModal");
const nickInput = document.getElementById("nickInput");
const regionInput = document.getElementById("regionInput");
let pendingSubmit = null; // { game, score }

function openNickModal(game, score) {
  pendingSubmit = { game, score };
  const existing = window.GH && window.GH.getNick && window.GH.getNick();
  if (existing) {
    nickInput.value = existing.nickname;
    regionInput.value = existing.region;
  }
  nickModal.hidden = false;
  setTimeout(() => nickInput.focus(), 100);
}

function closeNickModal() {
  nickModal.hidden = true;
  pendingSubmit = null;
}

document.getElementById("nickSave").addEventListener("click", async () => {
  const nickname = (nickInput.value || "").trim();
  const region = regionInput.value;
  if (!nickname || nickname.length < 2) { nickInput.focus(); return toast("Nome troppo corto"); }
  if (!region) { regionInput.focus(); return toast("Scegli una regione"); }
  if (!window.GH) return toast("Leaderboard non disponibile");
  window.GH.setNick({ nickname, region });
  if (pendingSubmit) {
    const r = await window.GH.submit(pendingSubmit.game, pendingSubmit.score);
    if (r.ok) toast("Pubblicato in classifica");
    else if (r.reason === "not-configured") toast("Leaderboard non configurata");
    else toast("Errore: " + (r.error || r.reason));
  }
  closeNickModal();
});

document.getElementById("nickSkip").addEventListener("click", closeNickModal);

async function publishScore(game, score) {
  if (!window.GH || !window.GH.configured) return;
  if (!Number.isFinite(score) || score <= 0) return;
  const nick = window.GH.getNick();
  if (!nick) { openNickModal(game, score); return; }
  const r = await window.GH.submit(game, score);
  if (r.ok) toast("Record pubblicato 🏆");
}

// ===== GAME 1: RPS BRAINROT =====
// shark (Tralalero) beats croc (Bombardiro)
// croc beats wood (Tung Tung)
// wood beats shark
const RPS_LABELS = { shark: "Tralalero", croc: "Bombardiro", wood: "Tung Tung" };
const RPS_BEATS = { shark: "croc", croc: "wood", wood: "shark" };
const RPS_OPTS = ["shark", "croc", "wood"];

let rpsYou = 0, rpsCpu = 0, rpsHistory = [];
const rpsYouEl = document.getElementById("rpsYou");
const rpsCpuEl = document.getElementById("rpsCpu");
const rpsRoundEl = document.getElementById("rpsRound");

document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    ensureAudio();
    if (rpsYou >= 5 || rpsCpu >= 5) return;
    const pickP = btn.dataset.pick;
    const cpuPick = RPS_OPTS[Math.floor(Math.random() * 3)];

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;

    let outcome;
    if (pickP === cpuPick) {
      outcome = "tie";
      reaction(pick(BRAINROT_TIE), "cyan");
      beep(440, 0.06);
      burst(cx, cy, 12, ["#00f0ff", "#ffffff"]);
      resetCombo();
    } else if (RPS_BEATS[pickP] === cpuPick) {
      outcome = "win";
      rpsYou++;
      rpsYouEl.textContent = rpsYou;
      bumpEl(rpsYouEl);
      const phrase = pick(BRAINROT_WIN);
      reaction(phrase, "lime");
      tts(pick(TTS_WIN));
      fanfare();
      burst(cx, cy, 40, ["#b6f500", "#ffd60a", "#00f0ff"]);
      burst(window.innerWidth/2, window.innerHeight/2, 60);
      shake();
      bumpCombo();
    } else {
      outcome = "lose";
      rpsCpu++;
      rpsCpuEl.textContent = rpsCpu;
      bumpEl(rpsCpuEl);
      reaction(pick(BRAINROT_LOSE), "pink");
      tts(pick(TTS_LOSE));
      failSound();
      burst(cx, cy, 20, ["#ff006e", "#fb5607"]);
      shake(true);
      resetCombo();
    }

    rpsHistory.push(outcome);
    rpsRoundEl.textContent = Math.min(rpsYou + rpsCpu + 1, 9);

    if (rpsYou === 5) {
      setTimeout(() => {
        reaction("MATCH TUO!", "lime");
        tts("Bravissimo, match tuo");
        fanfare();
        burst(window.innerWidth/2, 200, 80);
        publishScore("rps", rpsYou * 100 - rpsCpu * 10);
      }, 700);
    }
    if (rpsCpu === 5) {
      setTimeout(() => {
        reaction("MACCHINA VINCE!", "pink");
        tts("Porcamado, la macchina vince");
        failSound();
        shake(true);
      }, 700);
    }
  });
});

document.querySelector("[data-reset='rps']").addEventListener("click", () => {
  rpsYou = 0; rpsCpu = 0; rpsHistory = [];
  rpsYouEl.textContent = "0";
  rpsCpuEl.textContent = "0";
  rpsRoundEl.textContent = "1";
  beep(660, 0.08);
});

document.querySelector("[data-share='rps']").addEventListener("click", () => {
  const total = rpsYou + rpsCpu;
  const grid = total === 0 ? "(nessuna partita ancora)" : rpsHistory.map(o => o === "win" ? "🟩" : o === "lose" ? "🟥" : "🟨").join("");
  share(`🦈 Tralalero vs Bombardiro\nTu ${rpsYou} — Macchina ${rpsCpu}\n${grid}\n#gheigheimsitalia #brainrot`);
});

// ===== GAME 2: GUESS — DAILY CHALLENGE =====
const guessTriesEl = document.getElementById("guessTries");
const guessWinsEl = document.getElementById("guessWins");
const guessLastEl = document.getElementById("guessLast");
const guessInput = document.getElementById("guessInput");
const guessTrackEl = document.getElementById("guessTrack");
const guessTagEl = document.getElementById("guessTag");
const guessShareBtn = document.getElementById("guessShare");
const guessRetryBtn = document.getElementById("guessRetry");

function dailySeed() {
  const epoch = new Date("2026-01-01T00:00:00Z").getTime();
  const day = Math.floor((Date.now() - epoch) / 86400000);
  let s = day * 9301 + 49297;
  s = (s % 233280 + 233280) % 233280;
  const target = (s % 100) + 1;
  return { day: day + 1, target };
}

const GUESS_KEY = "gheigheims.guess.daily";
let guessState = null; // { day, target, tries, history, done, won }
let trainingMode = false;

function loadGuessState() {
  const seed = dailySeed();
  try {
    const stored = JSON.parse(localStorage.getItem(GUESS_KEY) || "null");
    if (stored && stored.day === seed.day) return stored;
  } catch {}
  return {
    day: seed.day, target: seed.target,
    tries: 7, history: [], done: false, won: false,
  };
}

function saveGuessState() {
  if (trainingMode) return;
  try { localStorage.setItem(GUESS_KEY, JSON.stringify(guessState)); } catch {}
}

function initGuessScene() {
  trainingMode = false;
  guessState = loadGuessState();
  renderGuess();
}

function renderGuess() {
  guessTagEl.textContent = trainingMode ? "Allenamento (codice casuale)" : `Sfida #${guessState.day} · Italia`;
  guessTriesEl.textContent = guessState.tries;
  guessWinsEl.textContent = guessState.done ? (guessState.won ? "SÌ" : "NO") : "—";
  guessLastEl.textContent = guessState.history.length > 0
    ? String(guessState.history[guessState.history.length - 1].v).padStart(2, "0")
    : "—";

  guessTrackEl.innerHTML = "";
  guessState.history.forEach(h => {
    const pill = document.createElement("span");
    pill.className = "guess-pill " + (h.r === "hit" ? "hit" : h.r === "low" ? "low" : "high");
    const icon = h.r === "hit" ? "🎯" : h.r === "high" ? "🔼" : "🔽";
    pill.textContent = `${String(h.v).padStart(2, "0")} ${icon}`;
    guessTrackEl.appendChild(pill);
  });

  const showShare = guessState.done && !trainingMode;
  guessShareBtn.style.display = showShare ? "" : "none";
  guessRetryBtn.style.display = guessState.done ? "" : "none";
  guessRetryBtn.textContent = trainingMode ? "Nuovo codice" : "Allenamento (extra)";
  guessInput.disabled = guessState.done;
}

function guessSubmit() {
  ensureAudio();
  if (!guessState || guessState.done) return;
  const v = parseInt(guessInput.value, 10);
  if (Number.isNaN(v) || v < 1 || v > 100) {
    reaction("1—100!", "pink");
    failSound();
    shake();
    return;
  }

  guessInput.value = "";

  if (v === guessState.target) {
    guessState.history.push({ v, r: "hit" });
    guessState.done = true;
    guessState.won = true;
    reaction("BRAVISSIMO!", "lime");
    tts("Bravissimo, sahur sahur");
    fanfare();
    burst(window.innerWidth/2, window.innerHeight/2, 80);
    shake();
    bumpCombo(3);
    saveGuessState();
    renderGuess();
    if (!trainingMode) {
      const attemptsUsed = 7 - guessState.tries + 1;
      const score = Math.max(0, (8 - attemptsUsed) * 100);
      setTimeout(() => publishScore("guess", score), 600);
    }
    return;
  }

  guessState.tries--;
  if (v < guessState.target) {
    guessState.history.push({ v, r: "high" });
    reaction("PIÙ ALTO!", "cyan");
    tts("Più alto");
    beep(660, 0.08);
  } else {
    guessState.history.push({ v, r: "low" });
    reaction("PIÙ BASSO!", "yellow");
    tts("Più basso");
    beep(330, 0.08);
  }
  bumpCombo();

  if (guessState.tries === 0) {
    guessState.done = true;
    guessState.won = false;
    reaction(`ERA ${guessState.target}!`, "pink");
    tts(`Porcamado, era ${guessState.target}`);
    failSound();
    shake(true);
    resetCombo();
  }

  saveGuessState();
  renderGuess();
  if (!guessState.done) guessInput.focus();
}

function guessReset() {
  trainingMode = true;
  const seed = Math.floor(Math.random() * 100) + 1;
  guessState = { day: 0, target: seed, tries: 7, history: [], done: false, won: false };
  beep(880, 0.08);
  renderGuess();
  guessInput.focus();
}

function guessShareCard() {
  const t = guessState;
  if (!t.done) return;
  const grid = t.history.map(h => h.r === "hit" ? "🎯" : h.r === "high" ? "🔼" : "🔽").join("");
  const result = t.won ? `${t.history.length}/7` : "X/7";
  const txt = `🎯 GHEIGHEIMS Italia — Sfida #${t.day}\nCodice di Tung Tung: ${result}\n${grid}\n#gheigheimsitalia #brainrot`;
  share(txt);
}

document.getElementById("guessSubmit").addEventListener("click", guessSubmit);
document.querySelector("[data-reset='guess']").addEventListener("click", guessReset);
guessShareBtn.addEventListener("click", guessShareCard);
guessInput.addEventListener("keydown", e => { if (e.key === "Enter") guessSubmit(); });

// ===== GAME 3: CLICKER — BOMBARDIRO RAGE =====
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
  clickState.textContent = "BOMBARDA!";
  clickState.className = "clicker-state live";
  clickSub.textContent = "Clicca a manetta";
  zone.classList.remove("locked");
  zone.classList.add("live");
  endsAt = performance.now() + DURATION_MS;
  clickTime.textContent = (DURATION_MS / 1000).toFixed(1);
  raf = requestAnimationFrame(tickClicker);
  sweep(220, 880, 0.35);
  reaction("VAI!", "lime");
  tts("Bombardiro, vai");
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
      if (recordMsg) { fanfare(); tts("Bravissimo, nuovo record"); }
      else { tts(pick(TTS_WIN)); }
      burst(window.innerWidth/2, window.innerHeight/2, 100);
      shake(true);
    }, 200);
    publishScore("click", count);
  } else {
    failSound();
    reaction("ZERO?!", "pink");
    tts("Zero? Porcamado");
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
    reaction(pick(BRAINROT_WIN), "lime");
    tts(pick(TTS_WIN));
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

document.querySelector("[data-share='click']").addEventListener("click", () => {
  const cps = (best / (DURATION_MS / 1000)).toFixed(1);
  share(`🔥 BOMBARDIRO CLICK RAGE\nIl mio record: ${best} click in 10s (${cps}/sec)\nBattimi se ce la fai\n#gheigheimsitalia #brainrot`);
});

// ===== LEADERBOARD =====
let currentLbGame = "click";
const lbList = document.getElementById("lbList");

document.querySelectorAll(".lb-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".lb-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentLbGame = tab.dataset.lb;
    beep(660, 0.05);
    loadLeaderboard(currentLbGame);
  });
});

document.getElementById("lbRefresh").addEventListener("click", () => loadLeaderboard(currentLbGame));

async function loadLeaderboard(game) {
  if (!window.GH) {
    lbList.innerHTML = '<div class="lb-empty">Modulo non caricato</div>';
    return;
  }
  if (!window.GH.configured) {
    lbList.innerHTML = `<div class="lb-empty">⚠️ Leaderboard non configurata.<br/>Vedi SETUP.md per attivare Firebase.</div>`;
    return;
  }
  lbList.innerHTML = '<div class="lb-empty">Caricamento…</div>';
  const r = await window.GH.top(game, 20);
  if (!r.ok || r.rows.length === 0) {
    lbList.innerHTML = '<div class="lb-empty">Nessun record ancora. Sii il primo!</div>';
    return;
  }
  const myNick = window.GH.getNick();
  lbList.innerHTML = r.rows.map((row, i) => {
    const isMe = myNick && row.nickname === myNick.nickname && row.region === myNick.region;
    const podium = i < 3 ? `podium-${i + 1}` : "";
    const me = isMe ? "me" : "";
    return `<div class="lb-row ${podium} ${me}">
      <div class="lb-rank">${String(i + 1).padStart(2, "0")}</div>
      <div class="lb-info">
        <p class="lb-name">${escapeHtml(row.nickname)}</p>
        <p class="lb-region">${escapeHtml(row.region)}</p>
      </div>
      <div class="lb-score">${row.score}</div>
    </div>`;
  }).join("");
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ===== INTRO BLAST =====
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    burst(window.innerWidth/2, window.innerHeight/3, 40);
    burst(window.innerWidth/4, window.innerHeight/2, 25);
    burst(window.innerWidth*3/4, window.innerHeight/2, 25);
  }, 400);
});

// First-tap sound primer
document.body.addEventListener("pointerdown", function primer() {
  ensureAudio();
  document.body.removeEventListener("pointerdown", primer);
}, { once: false });
