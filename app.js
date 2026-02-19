const input = document.getElementById('tex-input');
const container = document.getElementById('alphaTab');
const btnRender = document.getElementById('btn-render');
const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const loadingIndicator = document.getElementById('loading-indicator');
const statusMsg = document.getElementById('status-msg');

const settings = {
    core: {
        // engine: 'html5', // 1.8.1 uses 'svg' by default
    },
    display: {
        layoutMode: 0,    // LayoutMode.Page
        staveProfile: 'ScoreTab',  // 악보 + 타브 (1.8.1 권장 설정)
    },
    player: {
        enablePlayer: true,
        soundFont: 'https://unpkg.com/@coderline/alphatab@1.8.1/dist/soundfont/sonivox.sf2',
        scrollElement: document.getElementById('score-container')
    }
};

let api = null;

function initAlphaTab() {
    if (!window.alphaTab) {
        console.error("AlphaTab object not found.");
        statusMsg.innerText = "Error: AlphaTab JS not loaded";
        statusMsg.classList.add("text-red-500");
        return;
    }

    try {
        api = new window.alphaTab.AlphaTabApi(container, settings);

        btnRender.addEventListener('click', updateScore);

        input.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                updateScore();
            }
        });

        api.error.on((e) => {
            statusMsg.innerText = "Syntax Error";
            statusMsg.classList.add("text-red-500");
            console.error("AlphaTab Error:", e);
        });

        api.renderFinished.on(() => {
            statusMsg.innerText = "Ready";
            statusMsg.classList.remove("text-red-500");
        });

        api.playerReady.on(() => {
            loadingIndicator.classList.add('hidden');
            btnPlay.disabled = false;
        });

        api.playerStateChanged.on((args) => {
            const isPlaying = args.state === 1;

            if (isPlaying) {
                btnPlay.classList.add('hidden');
                btnPause.classList.remove('hidden');
                btnStop.disabled = false;
                statusMsg.innerText = "Playing 🎵";
                statusMsg.classList.add("text-indigo-600");
            } else {
                btnPlay.classList.remove('hidden');
                btnPause.classList.add('hidden');
                statusMsg.innerText = "Paused ⏸";
                statusMsg.classList.remove("text-indigo-600");
            }
        });

        updateScore();

    } catch (e) {
        console.error("Init Error:", e);
        statusMsg.innerText = "Init Failed";
    }
}

btnPlay.addEventListener('click', () => {
    if (api && !api.playerReady) loadingIndicator.classList.remove('hidden');
    if (api) api.playPause();
});

btnPause.addEventListener('click', () => {
    if (api) api.playPause();
});

btnStop.addEventListener('click', () => {
    if (api) {
        api.stop();
        btnStop.disabled = true;
        statusMsg.innerText = "Stopped";
    }
});

function updateScore() {
    if (!api) return;
    statusMsg.innerText = "Rendering...";
    statusMsg.classList.remove("text-red-500");

    try {
        api.tex(input.value);
    } catch (err) {
        statusMsg.innerText = "Syntax Error";
        statusMsg.classList.add("text-red-500");
        console.error(err);
    }
}

window.addEventListener('load', () => setTimeout(initAlphaTab, 100));
