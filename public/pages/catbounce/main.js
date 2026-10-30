function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let bg;

async function playMusic() {
    if (!bg) {
        console.log("MAKING NEW AUDIO");
        bg = new Audio("../../music/silly_cat.mp3");
        bg.loop = true;
        bg.volume = 0.5;
        bg.mute = true;

        bg.addEventListener('error', (e) => {
            console.error("Audio failed to load! Check the URL:", bg.src);
            console.error("Error details:", bg.error);
        });
    }

    // Setup toggle button
    const toggle_music = document.getElementById("toggle-music-btn");
    
    try {
        // Try to play it
        await bg.play();
        console.log("Audio started (muted).");

        const policy = navigator.getAutoplayPolicy?.("mediaelement") || "unknown";
        console.log("Current autoplay policy:", policy);
        
        // If we are allowed to have audio, unmute it
        if (policy !== "disallowed") {
            bg.mute = false;
            console.log("PLAYING (Unmuted)");
            document.getElementById('red_p')?.remove();
            document.getElementById('fix-audio-btn')?.remove();
            if (toggle_music) {
                toggle_music.addEventListener('click', (ev) => {
                    if (bg && bg.volume != 0) {
                        bg.volume = 0;
                    } else {
                        bg.volume = 0.5
                    }
                });
            }
        } else {
            console.log("D:")
        }
    } catch (err) {
        console.warn("Even muted autoplay failed:", err);
    }
    
    adjustButtonPositions();
    
    window.addEventListener('pageshow', (event) => {
        if (bg && bg.paused) {
            bg.play().catch(e => console.warn("Couldn't resume music on pageshow:", e));
        }
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && bg && bg.paused) {
            bg.play().catch(e => console.warn("Couldn't resume music on visibilitychange:", e));
        }
    });
}


// GIFS NOW WORK :DDD
let catsList = [];

async function loadCats() {
    try {
        const res = await fetch('../../api/cats.json?v=' + Date.now());
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        catsList = await res.json();
        
        if (!Array.isArray(catsList) || !catsList.length) {
            throw new Error('No cats returned in JSON');
        }
        console.log(`Successfully loaded ${catsList.length} cats!`);
    } catch (err) {
        console.error('Could not load cats:', err);
    }
    return catsList;
}

async function run_forever() {
    // I DONT NEED COMMENTS HERE, I KNOW WHAT THE FUCK I AM DOING!!
    let cats;
    try {
        cats = await loadCats();
    } catch (err) {
        console.error('Could not load cats:', err);
        return;
    }
    
    const catImg = document.getElementById('cat');
    // const pick = () => cats[Math.floor(Math.random() * cats.length)];
    const pick = () => {
        const p = cats[Math.floor(Math.random() * cats.length)];
        return /^(?:[a-z]+:)?\//i.test(p) ? p : '../../' + p;
    };
    let failCount = 0;
    
    function updateCat() {
        if (failCount > 5) {
            console.warn("Too many failed loads, sticking with current image.");
            failCount = 0; 
            return;
        }
        
        const nextCatUrl = pick() + '?r=' + Date.now();
        const tempImg = new Image();
        
        tempImg.onload = () => {
            catImg.src = nextCatUrl;
            failCount = 0;
        };
        
        tempImg.onerror = () => {
            console.warn('Cat image failed to load:', nextCatUrl);
            failCount++;
            setTimeout(updateCat, 1500); 
        };
        
        tempImg.src = nextCatUrl;
    }
    
    updateCat();
    
    while (true) {
        await sleep(randint(15, 20) * 1000);
        updateCat();
    }
}

// Why won't the music also play when the DOM is loaded?? Bro thinks they ain't like run_forever(); 😭
playMusic();

// Make sure DOM is loaded before starting
window.addEventListener('DOMContentLoaded', () => {
    run_forever();
});