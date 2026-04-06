let tracks = [];
let playlists = JSON.parse(localStorage.getItem('playlists') || '[]');

let current = 0,
    playing = false,
    shuffle = false,
    repeat = false,
    currentPlaylist = null;

const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const fileInput = document.getElementById('fileInput');

// загрузка файлов
function uploadClick() {
  fileInput.click();
}

fileInput.onchange = e => {
  for (let f of e.target.files) {
    if (!f.type.startsWith('audio/')) continue;

    const url = URL.createObjectURL(f);

    // добавляем сразу (фикс багов)
    tracks.push({ name: f.name, src: url, cover: '' });
    const index = tracks.length - 1;

    // читаем обложку (если есть)
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const buffer = ev.target.result;
        const view = new DataView(buffer);

        for (let i = 0; i < view.byteLength - 10; i++) {
          if (
            view.getUint8(i) === 0x41 &&
            view.getUint8(i + 1) === 0x50 &&
            view.getUint8(i + 2) === 0x49 &&
            view.getUint8(i + 3) === 0x43
          ) {
            const size = view.getUint32(i + 4);
            const start = i + 10;
            const blob = new Blob([buffer.slice(start, start + size)]);
            tracks[index].cover = URL.createObjectURL(blob);
            break;
          }
        }
      } catch (e) {}
    };

    reader.readAsArrayBuffer(f);
  }

  renderTracks();
};

// рендер библиотеки
function renderTracks() {
  currentPlaylist = null;
  let c = document.getElementById('tracks');
  c.innerHTML = '';

  tracks.forEach((t, i) => {
    let d = document.createElement('div');
    d.className = 'flex justify-between border p-2 mb-2';

    d.innerHTML = `
      ${t.name}
      <button onclick="event.stopPropagation();removeTrack(${i})">🗑</button>
    `;

    d.onclick = () => play(i);
    c.appendChild(d);
  });
}

// воспроизведение
function play(i) {
  current = i;
  audio.src = tracks[i].src;
  audio.play();
  playing = true;

  document.getElementById('trackName').innerText = tracks[i].name;

  let cover = document.getElementById('cover');
  cover.src = tracks[i].cover || '';
  cover.style.background = tracks[i].cover ? 'none' : '#222';

  update();
}

// управление
function toggle() {
  if (!audio.src) return;

  if (playing) audio.pause();
  else audio.play();

  playing = !playing;
  update();
}

function update() {
  document.getElementById('playBtn').innerText = playing ? '⏹' : '▶';
}

function next() {
  if (!tracks.length) return;

  if (shuffle) {
    current = Math.floor(Math.random() * tracks.length);
  } else {
    current = (current + 1) % tracks.length;
  }

  play(current);
}

function prev() {
  if (!tracks.length) return;

  current = (current - 1 + tracks.length) % tracks.length;
  play(current);
}

// режимы
function toggleShuffle() {
  shuffle = !shuffle;
  document.getElementById('shuffleBtn').classList.toggle('active');
}

function toggleRepeat() {
  repeat = !repeat;
  document.getElementById('repeatBtn').classList.toggle('active');
}

audio.onended = () => {
  if (repeat) play(current);
  else next();
};

// плейлисты
function createPlaylist() {
  let name = prompt('Название');
  if (!name) return;

  playlists.push({ name, tracks: [] });
  save();
  renderPlaylists();
}

function renderPlaylists() {
  let c = document.getElementById('playlists');
  c.innerHTML = '';

  playlists.forEach((p, i) => {
    let d = document.createElement('div');
    d.className = 'flex justify-between cursor-pointer';

    d.innerHTML = `
      <span>${p.name}</span>
      <button onclick="event.stopPropagation();removePlaylist(${i})">🗑</button>
    `;

    d.onclick = () => showPlaylist(i);
    c.appendChild(d);
  });
}

function removePlaylist(i) {
  playlists.splice(i, 1);
  save();
  renderPlaylists();
  showLibrary();
}

function showPlaylist(i) {
  currentPlaylist = i;

  let c = document.getElementById('tracks');
  c.innerHTML = '';

  playlists[i].tracks.forEach((idx, ind) => {
    let t = tracks[idx];

    let d = document.createElement('div');
    d.className = 'flex justify-between border p-2 mb-2';

    d.innerHTML = `
      ${t.name}
      <button onclick="event.stopPropagation();removeFromPlaylist(${ind})">🗑</button>
    `;

    d.onclick = () => play(idx);
    c.appendChild(d);
  });
}

function removeFromPlaylist(ind) {
  playlists[currentPlaylist].tracks.splice(ind, 1);
  save();
  showPlaylist(currentPlaylist);
}

function removeTrack(i) {
  tracks.splice(i, 1);
  renderTracks();
}

// сохранение
function save() {
  localStorage.setItem('playlists', JSON.stringify(playlists));
}

function showLibrary() {
  renderTracks();
}

// время
function format(t) {
  let m = Math.floor(t / 60) || 0;
  let s = Math.floor(t % 60) || 0;
  return m + ':' + (s < 10 ? '0' + s : s);
}

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    progress.value = (audio.currentTime / audio.duration) * 100;
    progress.style.setProperty('--value', progress.value + '%');

    document.getElementById('time').innerText =
      format(audio.currentTime) + ' / ' + format(audio.duration);
  }
});

// перемотка
progress.oninput = () => {
  if (audio.duration) {
    audio.currentTime = (progress.value / 100) * audio.duration;
  }
};

// звук
volume.oninput = () => {
  audio.volume = volume.value;
  volume.style.setProperty('--value', volume.value * 100 + '%');
};

// запуск
renderTracks();
renderPlaylists();
