// This is a classroom demo. Real accounts and admin permissions need a server.
const demoAccounts = [];
const demoAdmin = { username: "admin", password: "soundwave123" };
let currentTrack = null;
const audio = document.querySelector("#audio-player");
const loginForm = document.querySelector("#login-form");
const signupForm = document.querySelector("#signup-form");
const adminLoginForm = document.querySelector("#admin-login-form");
const authArea = document.querySelector("#auth-area");
const adminPanel = document.querySelector("#admin-panel");
const playerToggle = document.querySelector("#player-toggle");
const openLogin = document.querySelector("#open-login");
const openSignup = document.querySelector("#open-signup");
const openAdmin = document.querySelector("#open-admin");
const logoutButton = document.querySelector("#logout-button");
const trackList = document.querySelector(".track-list");

function showForm(form) {
  loginForm.hidden = form !== loginForm;
  signupForm.hidden = form !== signupForm;
  adminLoginForm.hidden = form !== adminLoginForm;
  document.querySelectorAll("#auth-area [role=status]").forEach((message) => message.textContent = "");
  authArea.hidden = false;
  authArea.scrollIntoView({ behavior: "smooth", block: "center" });
}
openLogin.addEventListener("click", () => showForm(loginForm));
openSignup.addEventListener("click", () => showForm(signupForm));
openAdmin.addEventListener("click", () => showForm(adminLoginForm));

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(signupForm);
  const account = { name: data.get("name").trim(), email: data.get("email").trim().toLowerCase(), password: data.get("password") };
  if (demoAccounts.some((item) => item.email === account.email)) {
    document.querySelector("#signup-message").textContent = "That email is already registered in this session.";
    return;
  }
  demoAccounts.push(account);
  signInUser(account);
  signupForm.reset();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const account = demoAccounts.find((item) => item.email === email && item.password === data.get("password"));
  if (!account) {
    document.querySelector("#login-message").textContent = "No matching account. Sign up first during this page session.";
    return;
  }
  signInUser(account);
  loginForm.reset();
});

function signInUser(account) {
  authArea.hidden = true;
  openLogin.hidden = openSignup.hidden = true;
  logoutButton.hidden = false;
  document.querySelector("#welcome-title").textContent = `Welcome, ${account.name}.`;
}
logoutButton.addEventListener("click", () => {
  logoutButton.hidden = false;
  openLogin.hidden = openSignup.hidden = false;
  logoutButton.hidden = true;
  document.querySelector("#welcome-title").textContent = "Find your next favorite song.";
  showForm(loginForm);
  document.querySelector("#login-message").textContent = "You are logged out.";
});

// Admin sign-in is separate from the regular user account form.
adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(adminLoginForm);
  if (data.get("2500031856") !== demoAdmin.username || data.get("12345678") !== demoAdmin.password) {
    document.querySelector("#admin-login-message").textContent = "Admin username or password is incorrect.";
    return;
  }
  adminLoginForm.reset();
  authArea.hidden = true;
  adminPanel.hidden = false;
  openLogin.hidden = openSignup.hidden = logoutButton.hidden = true;
  openAdmin.hidden = true;
  document.querySelector("#welcome-title").textContent = "Admin dashboard";
  refreshAdminList();
});

document.querySelector("#admin-logout").addEventListener("click", () => {
  adminPanel.hidden = true;
  openLogin.hidden = openSignup.hidden = false;
  openAdmin.hidden = false;
  document.querySelector("#welcome-title").textContent = "Find your next favorite song.";
  showForm(loginForm);
});

// Connect each visible song to the browser's built-in audio player.
async function playTrack(track) {
  currentTrack = track;
  audio.src = track.dataset.audio;
  document.querySelector("#now-playing-title").textContent = track.dataset.title;
  document.querySelector("#now-playing-artist").textContent = track.dataset.artist;
  playerToggle.disabled = false;
  try {
    await audio.play();
  } catch {
    document.querySelector("#now-playing-artist").textContent = "This audio file could not be played.";
  }
}
function connectPlayButton(track) {
  track.querySelector(".play-button").addEventListener("click", () => playTrack(track));
}
document.querySelectorAll(".track").forEach(connectPlayButton);
playerToggle.addEventListener("click", () => audio.paused ? audio.play() : audio.pause());
audio.addEventListener("play", () => {
  playerToggle.textContent = "Pause";
  document.querySelector("#now-playing-artist").textContent = `${currentTrack.dataset.artist} · Playing`;
});
audio.addEventListener("pause", () => {
  playerToggle.textContent = "Play";
  if (currentTrack) document.querySelector("#now-playing-artist").textContent = `${currentTrack.dataset.artist} · Paused`;
});
audio.addEventListener("ended", () => { playerToggle.textContent = "Play"; });

// Build the admin's remove buttons from the songs currently shown in the library.
function refreshAdminList() {
  const adminList = document.querySelector("#admin-track-list");
  adminList.replaceChildren();
  trackList.querySelectorAll(".track").forEach((track) => {
    const row = document.createElement("li");
    const title = document.createElement("span");
    const remove = document.createElement("button");
    title.textContent = `${track.dataset.title} — ${track.dataset.artist}`;
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      if (currentTrack === track) {
        audio.pause();
        audio.removeAttribute("src");
        currentTrack = null;
        playerToggle.disabled = true;
        playerToggle.textContent = "Play";
        document.querySelector("#now-playing-title").textContent = "Nothing playing";
        document.querySelector("#now-playing-artist").textContent = "Choose a track to begin";
      }
      track.remove();
      trackList.querySelectorAll(".track-number").forEach((number, index) => number.textContent = String(index + 1).padStart(2, "0"));
      refreshAdminList();
    });
    row.append(title, remove);
    adminList.append(row);
  });
}

document.querySelector("#add-track-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const file = data.get("audio");
  if (!file || !file.type.startsWith("audio/")) {
    document.querySelector("#admin-message").textContent = "Choose a valid audio file.";
    return;
  }
  const track = document.createElement("article");
  track.className = "track";
  track.dataset.title = data.get("title").trim();
  track.dataset.artist = data.get("artist").trim();
  track.dataset.audio = URL.createObjectURL(file);
  const number = document.createElement("span");
  number.className = "track-number";
  number.textContent = String(trackList.querySelectorAll(".track").length + 1).padStart(2, "0");
  const details = document.createElement("div");
  const title = document.createElement("h3");
  const artist = document.createElement("p");
  title.textContent = track.dataset.title;
  artist.textContent = track.dataset.artist;
  details.append(title, artist);
  const play = document.createElement("button");
  play.className = "play-button";
  play.type = "button";
  play.textContent = "Play";
  play.setAttribute("aria-label", `Play ${track.dataset.title}`);
  track.append(number, details, play);
  trackList.append(track);
  connectPlayButton(track);
  event.currentTarget.reset();
  document.querySelector("#admin-message").textContent = "Song added for this page session.";
  refreshAdminList();
});



