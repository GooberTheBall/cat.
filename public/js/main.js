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
        bg = new Audio("music/silly_cat.mp3");
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

async function loadCats() {
    const res = await fetch('/api/cats');
    if (!res.ok) throw new Error(`/api/cats -> ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) throw new Error('No cats returned');
    return data;
}

async function run_forever() {
    let cats;
    try {
        cats = await loadCats();
    } catch (err) {
        console.error('Could not load cats:', err);
        return;
    }
    
    const catImg = document.getElementById('cat');
    const pick = () => cats[Math.floor(Math.random() * cats.length)];
    let failCount = 0;
    
    function updateCat() {
        // If a file is totally corrupt or the tunnel is dead, don't loop forever
        if (failCount > 5) {
            console.warn("Too many failed loads, sticking with current image.");
            failCount = 0; 
            return;
        }
        
        // Add ?r= to bypass browser cache, but load it in the background first
        const nextCatUrl = pick() + '?r=' + Date.now();
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Only update the visible image if it actually loaded successfully
            catImg.src = nextCatUrl;
            failCount = 0;
        };
        
        tempImg.onerror = () => {
            console.warn('Cat image failed to load:', nextCatUrl);
            failCount++;
            // Wait 1.5 seconds before trying a different image
            setTimeout(updateCat, 1500); 
        };
        
        tempImg.src = nextCatUrl;
    }
    
    // Load the very first cat
    updateCat();
    
    while (true) {
        await sleep(randint(15, 20) * 1000);
        updateCat();
    }
}

playMusic();

// Make sure DOM is loaded before starting
window.addEventListener('DOMContentLoaded', () => {
    run_forever();
});