// Sakura Reading Aid Content Script
// Modes: off | bw | night | reading

let overlayEl = null;
let currentMode = "off";
let musicEnabled = false;
let audioCtx = null;
let gainNode = null;
let oscillators = [];

function ensureStyle() {
  let style = document.getElementById("sakura-style");
  if (!style) {
    style = document.createElement("style");
    style.id = "sakura-style";
    style.textContent = `
      html.sakura-bw { filter: grayscale(1) contrast(1.05); }
      html.sakura-night { filter: sepia(0.15) hue-rotate(330deg) brightness(0.95) contrast(0.9); }
      html.sakura-reading { background-color: #ebeb9fff !important; }

      /* Reduce motion for readability */
      * { transition: none !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }
}

function createOverlay(color, opacity) {
  if (overlayEl) return overlayEl;
  overlayEl = document.createElement("div");
  overlayEl.id = "sakura-overlay";
  overlayEl.style.position = "fixed";
  overlayEl.style.top = "0";
  overlayEl.style.left = "0";
  overlayEl.style.width = "100vw";
  overlayEl.style.height = "100vh";
  overlayEl.style.pointerEvents = "none";
  overlayEl.style.zIndex = "2147483647";
  overlayEl.style.background = color;
  overlayEl.style.opacity = String(opacity);
  overlayEl.style.mixBlendMode = "multiply";
  document.body.appendChild(overlayEl);
  return overlayEl;
}

function removeOverlay() {
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
}

function clearClasses() {
  const html = document.documentElement;
  html.classList.remove("sakura-bw", "sakura-night", "sakura-reading");
}

function applyMode(mode) {
  ensureStyle();
  const html = document.documentElement;
  clearClasses();
  removeOverlay();

  if (mode === "bw") {
    html.classList.add("sakura-bw");
  } else if (mode === "night") {
    html.classList.add("sakura-night");
    createOverlay("#2b1d0e", 0.08); // warm tint
  } else if (mode === "reading") {
    html.classList.add("sakura-reading");
    createOverlay("#ebeb9fff", 0.15); // old paper tint
  } else {
    // off
  }
  currentMode = mode;
  handleAmbientPlayback();
}

function handleAmbientPlayback() {
  if (!musicEnabled || currentMode === "off") {
    stopAmbient();
    return;
  }
  startAmbient();
}

function startAmbient() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    gainNode = gainNode || audioCtx.createGain();
    gainNode.gain.value = 0.03; // very low volume
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    const osc1 = audioCtx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 110; // A2

    const osc2 = audioCtx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.value = 220; // A3

    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.25; // slow
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 20; // mod depth

    lfo.connect(lfoGain).connect(filter.frequency);
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode).connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    oscillators.push(osc1, osc2, lfo);
  } catch (e) {
    // best-effort; ignore failures
  }
}

function stopAmbient() {
  try {
    for (const osc of oscillators) {
      try { osc.stop(); } catch {}
      try { osc.disconnect(); } catch {}
    }
    oscillators = [];
    if (gainNode) { try { gainNode.disconnect(); } catch {} }
    if (audioCtx && audioCtx.state !== "closed") {
      audioCtx.suspend().catch(() => {});
    }
  } catch (e) {
    // ignore
  }
}

function initFromStorage() {
  chrome.storage.local.get(["mode", "musicEnabled"], (res) => {
    const mode = res?.mode ?? "off";
    musicEnabled = res?.musicEnabled ?? false;
    applyMode(mode);
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SET_MODE") {
    applyMode(msg.mode ?? "off");
  }
  if (msg.type === "SET_MUSIC") {
    musicEnabled = !!msg.enabled;
    handleAmbientPlayback();
  }
  if (msg.type === "TOGGLE_OVERLAY") {
    // Backward compatibility: toggle reading mode
    const next = currentMode === "off" ? "reading" : "off";
    applyMode(next);
    chrome.storage.local.set({ mode: next });
  }
});

// Initialize on load
ensureStyle();
initFromStorage();
