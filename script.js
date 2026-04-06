let tracks = [];
let queue = [];
let playlists = [];
let current = 0;
let playing = false;
let repeatMode = false;

const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const now = document.getElementById('now');
const fileInput = document.getElementById('fileInput');
const search = document.getElementById('search');
localStorage
function uploadClick() {
  fileInput.click();
}
updatePlayIcon()
fileInput.onchange = e => {
  for (let f of e.target.files) {
    if (!f.type.startsWith('audio/')) {
      alert('Файл не поддерживается: ' + f.name);
      continue;
    }
    let url = URL.createObjectURL(f);
    tracks.push({ name: f.name, src: url });
  }
  renderTracks();
};

function renderTracks() {
  let c = document.getElementById('tracks');
  c.innerHTML = '';

  tracks.forEach((t, i) => {
    let d = document.createElement('div');
    d.className = 'track';
    d.innerHTML = `
      ${t.name}<br>
      <button onclick="event.stopPropagation(); addQueue(${i})">+</button>
      <button onclick="event.stopPropagation(); like(${i})">❤️</button>
    `;
    d.onclick = () => play(i);
    c.appendChild(d);
  });
}

async function play(i) {
  try {
    current = i;
    audio.src = tracks[i].src;
    await audio.play();
    now.innerText = tracks[i].name;
    playing = true;
  } catch (err) {
    alert('Ошибка воспроизведения');
  }
}

function toggle() {
  if (!audio.src) return;
  playing ? audio.pause() : audio.play();
  playing = !playing;
}

function next() {
  if (queue.length) {
    play(queue.shift());
  } else if (tracks.length) {
    play((current + 1) % tracks.length);
  }
  renderQueue();
}

function prev() {
  if (tracks.length) play(current);
}

function shuffle() {
  tracks.sort(() => Math.random() - 0.5);
  renderTracks();
}

function repeat() {
  repeatMode = !repeatMode;
  alert('Repeat: ' + repeatMode);
}

function addQueue(i) {
  queue.push(i);
  renderQueue();
}

function renderQueue() {
  let q = document.getElementById('queue');
  q.innerHTML = '';
  queue.forEach(i => {
    let d = document.createElement('div');
    d.innerText = tracks[i].name;
    q.appendChild(d);
  });
}

function like(i) {
  alert('Лайк: ' + tracks[i].name);
}

function createPlaylist() {
  let name = prompt('Название');
  if (!name) return;
  playlists.push({ name, tracks: [] });
  renderPlaylists();
}

function renderPlaylists() {
  let c = document.getElementById('playlists');
  c.innerHTML = '';
  playlists.forEach(p => {
    let d = document.createElement('div');
    d.innerText = p.name;
    c.appendChild(d);
  });
}

audio.addEventListener('timeupdate', () => {
  if (isFinite(audio.duration) && audio.duration > 0) {
    progress.value = (audio.currentTime / audio.duration) * 100;
  }
});

progress.oninput = () => {
  if (isFinite(audio.duration) && audio.duration > 0) {
    let t = (progress.value / 100) * audio.duration;
    if (isFinite(t)) audio.currentTime = t;
  }
};

volume.oninput = () => {
  audio.volume = volume.value;
};

audio.onended = () => {
  if (repeatMode) play(current);
  else next();
};

search.oninput = e => {
  let val = e.target.value.toLowerCase();
  document.querySelectorAll('#tracks div').forEach(d => {
    d.style.display = d.innerText.toLowerCase().includes(val)
      ? 'block'
      : 'none';
  });
progress.style.setProperty('--value', progress.value + '%');
volume.style.setProperty('--value', (volume.value*100) + '%');
};
