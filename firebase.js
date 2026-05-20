// Firebase init + leaderboard API exposed as window.GH
// Replace the firebaseConfig values below with your own (see SETUP.md).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, where, orderBy,
  limit as qLimit, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ⚠️ REPLACE with your own Firebase web app config.
// Get it at: console.firebase.google.com → your project → ⚙️ Settings → General → Your apps → Web → Config
const firebaseConfig = {
  apiKey: "AIzaSyBxax0dR2WOsCCtmkqAukpXaheQduXQP_s",
  authDomain: "gheigheimsitalia.firebaseapp.com",
  projectId: "gheigheimsitalia",
  storageBucket: "gheigheimsitalia.firebasestorage.app",
  messagingSenderId: "643742203368",
  appId: "1:643742203368:web:0a24a1c4daeafe83d4f85d",
};

const configured = !Object.values(firebaseConfig).some(v => String(v).includes("REPLACE_ME"));

let db = null;
if (configured) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.warn("Firebase init failed:", e);
  }
}

const NICK_KEY = "gheigheims.nick";
const REGION_KEY = "gheigheims.region";

function getNick() {
  const nickname = localStorage.getItem(NICK_KEY) || "";
  const region = localStorage.getItem(REGION_KEY) || "";
  return nickname && region ? { nickname, region } : null;
}

function setNick({ nickname, region }) {
  localStorage.setItem(NICK_KEY, nickname);
  localStorage.setItem(REGION_KEY, region);
}

async function submit(game, score) {
  if (!db) return { ok: false, reason: "not-configured" };
  const nick = getNick();
  if (!nick) return { ok: false, reason: "no-nick" };
  if (typeof score !== "number" || score <= 0) return { ok: false, reason: "bad-score" };
  try {
    await addDoc(collection(db, "scores"), {
      nickname: nick.nickname.slice(0, 16),
      region: nick.region.slice(0, 32),
      game,
      score,
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (e) {
    console.warn("submit failed:", e);
    return { ok: false, reason: "error", error: e.message };
  }
}

async function top(game, n = 10) {
  if (!db) return { ok: false, rows: [], reason: "not-configured" };
  try {
    const q = query(
      collection(db, "scores"),
      where("game", "==", game),
      orderBy("score", "desc"),
      qLimit(n)
    );
    const snap = await getDocs(q);
    const rows = [];
    snap.forEach(doc => rows.push({ id: doc.id, ...doc.data() }));
    return { ok: true, rows };
  } catch (e) {
    console.warn("top failed:", e);
    return { ok: false, rows: [], reason: "error", error: e.message };
  }
}

window.GH = {
  configured,
  getNick,
  setNick,
  submit,
  top,
};

// notify app.js if it loads before this module
window.dispatchEvent(new CustomEvent("gh-ready", { detail: { configured } }));
