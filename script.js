// script.js

// Functionality for the music player
let currentTrackIndex = 0;
const tracks = [];

function playTrack(index) {
    if(index < 0 || index >= tracks.length) return;
    const track = tracks[index];
    console.log(`Playing: ${track.title}`);
    // Logic to play track goes here
}

function pauseTrack() {
    console.log('Paused current track.');
    // Logic to pause track goes here
}

function nextTrack() {
    currentTrackIndex++;
    if(currentTrackIndex >= tracks.length) currentTrackIndex = 0;
    playTrack(currentTrackIndex);
}

function previousTrack() {
    currentTrackIndex--;
    if(currentTrackIndex < 0) currentTrackIndex = tracks.length - 1;
    playTrack(currentTrackIndex);
}

// Playlist management functionality
function addTrack(track) {
    tracks.push(track);
    console.log(`Added track: ${track.title}`);
}

function removeTrack(index) {
    if(index < 0 || index >= tracks.length) return;
    const removed = tracks.splice(index, 1);
    console.log(`Removed track: ${removed[0].title}`);
}

// Song import functionality
function importSongs(songArray) {
    songArray.forEach(song => addTrack(song));
}

// Example usage
importSongs([{ title: 'Song 1' }, { title: 'Song 2' }, { title: 'Song 3' }]);
