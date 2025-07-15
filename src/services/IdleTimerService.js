// services/IdleTimerService.js
let idleTimeout = 60 * 60 * 1000; // 1 hour
let warningDuration = 60 * 1000; // 1 minute warning
let lastActivityKey = "last_activity_time";
let countdownCallback = null;
let logoutCallback = null;
let warningTimer, idleTimer;

function resetIdleTimer() {
  const now = Date.now();
  localStorage.setItem(lastActivityKey, now.toString());

  clearTimeout(idleTimer);
  clearTimeout(warningTimer);

  // Warning 1 minute before logout
  warningTimer = setTimeout(() => {
    if (countdownCallback) countdownCallback(); // e.g. show modal
  }, idleTimeout - warningDuration);

  idleTimer = setTimeout(() => {
    if (logoutCallback) logoutCallback(); // e.g. clear tokens, redirect
  }, idleTimeout);
}

function setupIdleTimer({ onCountdown, onLogout }) {
  countdownCallback = onCountdown;
  logoutCallback = onLogout;

  window.addEventListener("mousemove", resetIdleTimer);
  window.addEventListener("keydown", resetIdleTimer);
  window.addEventListener("click", resetIdleTimer);
  window.addEventListener("scroll", resetIdleTimer);
  window.addEventListener("touchstart", resetIdleTimer);

  // Sync activity across tabs
  window.addEventListener("storage", (event) => {
    if (event.key === lastActivityKey) {
      resetIdleTimer();
    }
  });

  resetIdleTimer(); // Start initial timers
}

function clearIdleTimer() {
  clearTimeout(idleTimer);
  clearTimeout(warningTimer);
  window.removeEventListener("mousemove", resetIdleTimer);
  window.removeEventListener("keydown", resetIdleTimer);
  window.removeEventListener("click", resetIdleTimer);
  window.removeEventListener("scroll", resetIdleTimer);
  window.removeEventListener("touchstart", resetIdleTimer);
}

export default {
  setupIdleTimer,
  clearIdleTimer,
};
