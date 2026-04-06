let tracks = [];
let playlists = JSON.parse(localStorage.getItem('playlists') || '[]');

let current = 0;
let playing = false;
let shuffle = false;
let repeat = false;

const audio = document.getElementById('audio');
const now = document.getElementById('now');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const playBtn = document.getElementById('playBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const backBtn = document.getElementById('backBtn');
const fileInput = document.getElementById('fileInput');

// SVG
const playSVG = `<svg width="28" height="28" stroke="currentColor" fill="none"><circle cx="12" cy="12" r="10"/><path d="M9 9l6 3-6 3z"/></svg>`;
const pauseSVG = `<svg width="28" height="28" stroke="currentColor" fill="none"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/></svg>`;

const shuffleSVG = `<svg width="24" height="24" stroke="currentColor" fill="none"><path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/></svg>`;
const repeatSVG = shuffleSVG;

const heartSVG = `<svg width="20" height="20" stroke="currentColor" fill="none"><path d="M2 9.5a5.5 5.5 0 0 1 9.5-3.6 5.5 5.5 0 0 1 9.5 3.6c0 2-1 3-2 4l-5 5-5-5c-1-1-2-2-2-4"/></svg>`;
const plusSVG = `<svg width="20" height="20" stroke="currentColor" fill="none"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
const trashSVG = `<svg width="20" height="20" stroke="currentColor" fill="none"><path d="M3 6h18"/><path d="M19 6v14H5V6"/></svg>`;
const backSVG = `<svg width="20" height="20" stroke="currentColor" fill="none"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;

// init icons
playBtn.innerHTML = playSVG;
shuffleBtn.innerHTML = shuffleSVG;
repeatBtn.innerHTML = repeatSVG;
backBtn.innerHTML = backSVG;

// ===== ЗАГРУЗКА =====
function uploadClick() {
fileInput.click();
}

fileInput.onchange = e => {
for (let f of e.target.files) {
tracks.push({
name: f.name,
src: URL.createObjectURL(f),
liked: false
});
}
renderTracks();
};

// ===== РЕНДЕР =====
function renderTracks() {
const container = document.getElementById('tracks');
container.innerHTML = '';

tracks.forEach((t, i) => {
const row = document.createElement('div');
row.className = 'flex justify-between border p-2 mb-2';

```
row.innerHTML = `
  ${t.name}
  <div class="flex gap-2">
    <button onclick="event.stopPropagation(); like(${i})">${heartSVG}</button>
    <button onclick="event.stopPropagation(); addToPlaylist(${i})">${plusSVG}</button>
    <button onclick="event.stopPropagation(); removeTrack(${i})">${trashSVG}</button>
  </div>
`;

row.onclick = () => play(i);
container.appendChild(row);
```

});
}

// ===== ПЛЕЕР =====
function play(i) {
current = i;
audio.src = tracks[i].src;
audio.play();
playing = true;
now.innerText = tracks[i].name;
updatePlayIcon();
}

function toggle() {
if (!audio.src) return;

playing ? audio.pause() : audio.play();
playing = !playing;
updatePlayIcon();
}

function updatePlayIcon() {
playBtn.innerHTML = playing ? pauseSVG : playSVG;
}

// ===== НАВИГАЦИЯ =====
function next() {
if (shuffle) {
current = Math.floor(Math.random() * tracks.length);
} else {
current = (current + 1) % tracks.length;
}
play(current);
}

function prev() {
current = (current - 1 + tracks.length) % tracks.length;
play(current);
}

// ===== SHUFFLE / REPEAT =====
function toggleShuffle() {
shuffle = !shuffle;
shuffleBtn.classList.toggle('active');
}

function toggleRepeat() {
repeat = !repeat;
repeatBtn.classList.toggle('active');
}

audio.onended = () => {
repeat ? play(current) : next();
};

// ===== ЛАЙК =====
function like(i) {
tracks[i].liked = !tracks[i].liked;
renderTracks();
}

// ===== ПЛЕЙЛИСТЫ =====
function createPlaylist() {
const name = prompt('Название плейлиста');
if (!name) return;

playlists.push({ name, tracks: [] });
savePlaylists();
renderPlaylists();
}

function addToPlaylist(i) {
if (!playlists.length) {
alert('Сначала создай плейлист');
return;
}

const list = playlists.map((p, i) => i + ': ' + p.name).join('\n');
const choice = parseInt(prompt(list));

if (!isNaN(choice) && playlists[choice]) {
playlists[choice].tracks.push(i);
savePlaylists();
}
}

function renderPlaylists() {
const container = document.getElementById('playlists');
container.innerHTML = '';

playlists.forEach((p, i) => {
const row = document.createElement('div');

```
row.innerHTML = `
  ${p.name}
  <button onclick="event.stopPropagation(); removePlaylist(${i})">${trashSVG}</button>
`;

row.onclick = () => showPlaylist(i);
container.appendChild(row);
```

});
}

function showPlaylist(i) {
const container = document.getElementById('tracks');
container.innerHTML = '';

playlists[i].tracks.forEach(idx => {
const t = tracks[idx];
const row = document.createElement('div');

```
row.innerText = t.name;
row.onclick = () => play(idx);

container.appendChild(row);
```

});
}

function removePlaylist(i) {
playlists.splice(i, 1);
savePlaylists();
renderPlaylists();
}

function savePlaylists() {
localStorage.setItem('playlists', JSON.stringify(playlists));
}

function showLibrary() {
renderTracks();
}

// ===== УДАЛЕНИЕ =====
function removeTrack(i) {
tracks.splice(i, 1);
renderTracks();
}

// ===== ПРОГРЕСС =====
audio.addEventListener('timeupdate', () => {
if (audio.duration) {
progress.value = (audio.currentTime / audio.duration) * 100;
progress.style.setProperty('--value', progress.value + '%');
}
});

progress.oninput = () => {
if (audio.duration) {
audio.currentTime = (progress.value / 100) * audio.duration;
progress.style.setProperty('--value', progress.value + '%');
}
};

// ===== ГРОМКОСТЬ =====
volume.oninput = () => {
audio.volume = volume.value;
volume.style.setProperty('--value', (volume.value * 100) + '%');
};

// INIT
renderTracks();
renderPlaylists();
