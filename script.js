const playerContainer = document.querySelector('.player-container');
const audio = new Audio('your-default-track.mp3');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const progress = document.getElementById('progress');
const progressContainer = document.querySelector('.progress-container');
const volumeSlider = document.getElementById('volume');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const albumArt = document.querySelector('.album-art');

// Mock data (Replace with your actual data source)
const songs = [
    {
        title: "Neon Dreams",
        artist: "Wave Rider",
        file: "neon-dreams.mp3",
        cover: "https://source.unsplash.com/random/800x800/?music,night"
    },
    {
        title: "Cyber Love",
        artist: "Synth Warrior",
        file: "cyber-love.mp3",
        cover: "https://source.unsplash.com/random/800x800/?music,cyberpunk"
    }
];

let songIndex = 0;

// Initialize player
function loadSong(song) {
    titleEl.textContent = song.title;
    artistEl.textContent = song.artist;
    audio.src = song.file;
    albumArt.querySelector('.art').src = song.cover;
}

// Play/pause toggle
function togglePlay() {
    playerContainer.classList.toggle('playing');
    
    if (audio.paused) {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Update progress bar
function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Update time display
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

// Set progress
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    
    audio.currentTime = (clickTime / width) * duration;
}

// Volume control
function setVolume() {
    audio.volume = this.value;
}

// Time formatting
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Change song
function changeSong(direction) {
    songIndex = (songIndex + direction + songs.length) % songs.length;
    loadSong(songs[songIndex]);
    if (playerContainer.classList.contains('playing')) {
        audio.play();
    }
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', () => changeSong(-1));
nextBtn.addEventListener('click', () => changeSong(1));
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => changeSong(1));
progressContainer.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);

// Visualizer (Web Audio API)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);

source.connect(analyser);
analyser.connect(audioContext.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const visualizer = document.getElementById('visualizer');

function createVisualizer() {
    const bars = 50;
    for (let i = 0; i < bars; i++) {
        const bar = document.createElement('div');
        bar.className = 'visual-bar';
        visualizer.appendChild(bar);
    }
}

function updateVisualizer() {
    analyser.getByteFrequencyData(dataArray);
    
    const bars = document.querySelectorAll('.visual-bar');
    bars.forEach((bar, i) => {
        const height = dataArray[i] / 2;
        bar.style.height = `${height}px`;
        bar.style.background = `linear-gradient(to top, 
            var(--neon-pink) ${height}%, 
            var(--neon-blue) 100%)`;
    });
    
    requestAnimationFrame(updateVisualizer);
}

createVisualizer();
updateVisualizer();

// Initialize first song
loadSong(songs[0]);