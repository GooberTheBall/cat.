function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let bg;

async function playMusic() {
    if (!bg) {
        bg = new Audio("music/silly_cat.mp3");
        bg.loop = true;
        bg.volume = 0.5;
        bg.mute = true;
    }
    
    const policy = navigator.getAutoplayPolicy?.("mediaelement") || "unknown";
    console.log("Current autoplay policy:", policy);
    
    
    if (policy != "allowed-muted" && policy != "disallowed") {
        document.getElementById('red_p').remove();
        document.getElementById('fix-audio-btn').remove();
        bg.mute = false;
        await bg.play();
        adjustButtonPositions();
    } else {
        console.warn("Autoplay blocked!", policy);
        adjustButtonPositions();
        bg.mute = false;
        await bg.play();
        return
    }
    
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
run_forever();