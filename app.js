"use strict";
const guest = (new URLSearchParams(location.search).get("to") || "").trim();
document.querySelectorAll(".nama-tamu").forEach(element => {
  element.textContent = guest || "Tamu Undangan";
});
const main = document.querySelector("#main-content");
const music = document.querySelector("#musik");
const musicButton = document.querySelector("#music-toggle");
const musicStatus = document.querySelector("#music-status");
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
let opened = false;
function updateMusicButton() {
  const playing = !music.paused;
  musicButton.textContent = playing ? "Jeda musik" : "Putar musik";
  musicButton.setAttribute("aria-pressed", String(playing));
}
async function playMusic() {
  try {
    await music.play();
    musicStatus.textContent = "Musik diputar.";
  } catch {
    musicStatus.textContent = "Musik belum dapat diputar. Tekan Putar musik untuk mencoba kembali.";
  }
  updateMusicButton();
}
music.addEventListener("play", updateMusicButton);
music.addEventListener("pause", updateMusicButton);
music.addEventListener("error", () => {
  musicStatus.textContent = "Musik tidak dapat dimuat. Isi undangan tetap dapat dibaca.";
});
musicButton.addEventListener("click", () => {
  if (music.paused) void playMusic();
  else music.pause();
});
function openInvitation(withMusic = false) {
  if (!opened) {
    opened = true;
    document.querySelector(".music-control").hidden = false;
  }
  if (withMusic) void playMusic();
}
document.querySelector("#tombol").addEventListener("click", event => {
  event.preventDefault();
  openInvitation(true);
  main.focus({ preventScroll: true });
  window.scrollTo({
    top: main.getBoundingClientRect().top + window.scrollY,
    behavior: motionPreference.matches ? "auto" : "smooth"
  });
});
document.querySelector(".skip-link").addEventListener("click", () => openInvitation());
if (location.hash && document.getElementById(location.hash.slice(1))) openInvitation();
const eventTime = Date.parse(document.querySelector(".event-card time").dateTime);
const countdown = document.querySelector("#countdown");
const eventStatus = document.querySelector("#event-status");
function updateCountdown() {
  const remaining = eventTime - Date.now();
  if (remaining <= 0) {
    countdown.hidden = true;
    eventStatus.textContent = "Tanggal acara telah berlalu. Terima kasih atas doa dan perhatian Anda.";
    return false;
  }
  countdown.hidden = false;
  if (!eventStatus.textContent) eventStatus.textContent = "Menuju akad nikah";
  const seconds = Math.floor(remaining / 1000);
  const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  ["hari", "jam", "menit", "detik"].forEach((id, index) => {
    document.getElementById(id).textContent = String(values[index]);
  });
  return true;
}
if (updateCountdown()) {
  const timer = setInterval(() => { if (!updateCountdown()) clearInterval(timer); }, 1000);
}
document.querySelectorAll("[data-gallery]").forEach(gallery => {
  const images = [...gallery.querySelectorAll(".gallery-slides img")];
  const status = gallery.querySelector("[data-gallery-status]");
  const playButton = gallery.querySelector("[data-play]");
  const imageState = gallery.querySelector('.gallery-state');
  function updateImageState() {
    const image = images[current];
    const failed = image.complete && image.naturalWidth === 0;
    imageState.hidden = image.complete && !failed;
    imageState.textContent = failed ? 'Foto tidak dapat dimuat. Coba foto berikutnya atau muat ulang halaman.' : 'Memuat foto…';
  }
  images.forEach(image => { image.addEventListener('load', updateImageState); image.addEventListener('error', updateImageState); });
  let current = 0;
  let playing = !motionPreference.matches;
  let visible = false;
  gallery.querySelector(".gallery-controls").hidden = false;
  function updatePlayback() {
    playButton.textContent = playing ? "Jeda galeri" : "Putar galeri";
    playButton.setAttribute("aria-pressed", String(playing));
    status.setAttribute("aria-live", playing ? "off" : "polite");
  }
  function showSlide(next, manual = false) {
    if (manual) { playing = false; updatePlayback(); }
    images[current].hidden = true;
    current = (next + images.length) % images.length;
    images[current].hidden = false;
    status.textContent = `Foto ${current + 1} dari ${images.length}`;
    updateImageState();
  }
  gallery.querySelector("[data-prev]").addEventListener("click", () => showSlide(current - 1, true));
  gallery.querySelector("[data-next]").addEventListener("click", () => showSlide(current + 1, true));
  playButton.addEventListener("click", () => { playing = !playing; updatePlayback(); });
  gallery.addEventListener("keydown", event => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(current + (event.key === "ArrowRight" ? 1 : -1), true);
    }
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(gallery);
  } else visible = true;
  motionPreference.addEventListener("change", event => {
    if (event.matches) { playing = false; updatePlayback(); }
  });
  setInterval(() => {
    if (opened && playing && visible && !document.hidden && !gallery.matches(":hover") && !gallery.contains(document.activeElement)) showSlide(current + 1);
  }, 5000);
  updatePlayback();
  updateImageState();
});
const form = document.querySelector("#rsvp-form");
const nameInput = document.querySelector("#guest-name");
const attendance = document.querySelector("#attendance");
const countInput = document.querySelector("#guest-count");
const result = document.querySelector("#rsvp-result");
const feedback = document.querySelector("#form-feedback");
form.hidden = false;
form.noValidate = true;
document.querySelector("#form-unavailable").hidden = true;
nameInput.value = guest.slice(0, 120);
let confirmation = "";
function clearError(input, id) {
  input.removeAttribute("aria-invalid");
  document.getElementById(id).hidden = true;
  document.getElementById(id).textContent = "";
}
function setError(input, id, message) {
  input.setAttribute("aria-invalid", "true");
  const error = document.getElementById(id);
  error.textContent = message;
  error.hidden = false;
}
function hideOldResult() {
  result.hidden = true;
  confirmation = "";
  feedback.textContent = "";
}
attendance.addEventListener("change", () => {
  const absent = attendance.value === "tidak_hadir";
  document.querySelector("#count-field").hidden = absent;
  countInput.disabled = absent;
  countInput.required = !absent;
  clearError(attendance, "attendance-error");
  clearError(countInput, "count-error");
  hideOldResult();
});
form.addEventListener("input", event => {
  hideOldResult();
  if (event.target === nameInput) clearError(nameInput, "name-error");
  if (event.target === countInput) clearError(countInput, "count-error");
});
form.addEventListener("submit", event => {
  event.preventDefault();
  hideOldResult();
  [[nameInput, "name-error"], [attendance, "attendance-error"], [countInput, "count-error"]].forEach(([input, id]) => clearError(input, id));
  const invalid = [];
  const name = nameInput.value.trim();
  if (!name || name.length > 120) {
    setError(nameInput, "name-error", "Masukkan nama tamu, maksimal 120 karakter."); invalid.push(nameInput);
  }
  if (!["hadir", "tidak_hadir"].includes(attendance.value)) {
    setError(attendance, "attendance-error", "Pilih apakah Anda akan hadir."); invalid.push(attendance);
  }
  const count = Number(countInput.value);
  if (attendance.value === "hadir" && (!Number.isInteger(count) || count < 1 || count > 100)) {
    setError(countInput, "count-error", "Masukkan jumlah tamu berupa angka bulat 1–100."); invalid.push(countInput);
  }
  if (invalid.length) {
    feedback.textContent = "Periksa kolom yang ditandai sebelum membuat ringkasan.";
    invalid[0].focus();
    return;
  }
  const attending = attendance.value === "hadir";
  confirmation = `Konfirmasi undangan Tsaqif & Thea\nNama: ${name}\nKehadiran: ${attending ? "Akan hadir" : "Belum bisa hadir"}\nJumlah tamu: ${attending ? count : 0}\nAcara: Jumat, 25 Desember 2026, 07.00 WIB\nTempat: ASTON Priority Simatupang & Conference Center (lokasi contoh)`;
  document.querySelector("#confirmation-text").textContent = confirmation;
  result.hidden = false;
  result.focus();
  feedback.textContent = "Ringkasan berhasil dibuat di perangkat ini. Pesan belum dikirim kepada pengundang.";
});
document.querySelector("#copy-confirmation").addEventListener("click", async () => {
  if (!confirmation) return;
  try {
    await navigator.clipboard.writeText(confirmation);
    feedback.textContent = "Pesan disalin. Tempel dan kirim kepada pengundang melalui kanal komunikasi Anda.";
  } catch {
    feedback.textContent = "Penyalinan otomatis tidak tersedia. Pilih teks ringkasan untuk menyalin secara manual, atau gunakan Unduh pesan.";
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(document.querySelector("#confirmation-text"));
    selection.removeAllRanges();
    selection.addRange(range);
  }
});
document.querySelector("#download-confirmation").addEventListener("click", () => {
  if (!confirmation) return;
  const url = URL.createObjectURL(new Blob([confirmation], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "konfirmasi-tsaqif-thea.txt";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  feedback.textContent = "Unduhan pesan dimulai. Kirim berkas kepada pengundang; unduhan ini bukan pengiriman konfirmasi.";
});
if ('IntersectionObserver' in window) {
  const sectionLinks = [...document.querySelectorAll('.section-nav a')];
  const sectionObserver = new IntersectionObserver(entries => {
    const active = entries.filter(entry => entry.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!active) return;
    sectionLinks.forEach(link => {
      if (link.hash === '#' + active.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-80px 0px -60% 0px' });
  document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
}
