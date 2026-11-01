const translatebtn = document.getElementById("translate-btn");
const translate_output = document.getElementById("txt-output-txt")
const loading_element = document.getElementById("loading-box")

const construction_sfx = new Audio("../../sfx/construction.mp3")
construction_sfx.loop = true;
construction_sfx.volume = 0.35;
construction_sfx.muted = true;
const roblox_sfx = new Audio("../../sfx/roblox-victory.mp3")

let bg;

let TRANSLATING = false;
let GOTTEN_INPUT;
let GOTTEN_OUTPUT;
let RND_NUM;
let ALL_WORDS = true
let SFX_ACTIVE = false;
let VICTORY_ACTIVE = false;

const OUTPUT_WORDS = [
    "meow",
    "purr",
    ":3",
    "mew",
    "maw",
    ">w<",
    "uwu",
    ">:3",
    "rawr~",
    "mrrp",
    "hsssss",
    "grrrrr",
    "waaaaow",
    "mrowwwww",
    "waaaah",
    "mip",
    "mrgl",
    "snff",
    "pff"
]

async function play_construction_sfx() {
    if (construction_sfx.muted == true) {
        construction_sfx.muted = false;
    }
}

async function stop_construction_sfx() {
    if (construction_sfx.muted == false) {
        construction_sfx.muted = true;
    }
}

async function play_victory() {
    const soundClone = roblox_sfx.cloneNode();
    soundClone.volume = 0.35;
    soundClone.play();
}

async function playMusic() {
    if (!bg) {
        console.log("MAKING NEW AUDIO");
        bg = new Audio("../../music/Just Add Water.mp3");
        bg.loop = true;
        bg.volume = 0.5;
        bg.mute = true;

        bg.addEventListener('error', (e) => {
            console.error("Audio failed to load! Check the URL:", bg.src);
            console.error("Error details:", bg.error);
        });
    }
    
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
        } else {
            console.log("D:")
        }
    } catch (err) {
        console.warn("Even muted autoplay failed:", err);
        alert("If you want music, put autoplay on! - GooberTheBall")
    }
    
    window.addEventListener('pageshow', (event) => {
        const policy = navigator.getAutoplayPolicy?.("mediaelement") || "unknown";
        if (bg && bg.paused && policy !== "disallowed") {
            console.log("RESUMING??? - pageshow")
            bg.play().catch(e => console.warn("Couldn't resume music on pageshow:", e));
        }
    });
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let LOADING_AMOUNT = randint(3,5);

function generate_cat_speech(input_txt) {

    const parts = input_txt.split(/(\b[\w']+\b)/g);

    const wordIndices = [];
    for (let i = 1; i < parts.length; i += 2) wordIndices.push(i);

    let picks;
    if (ALL_WORDS) {
        picks = wordIndices;
    } else {
        picks = wordIndices.filter(() => randint(1, 10) === 1);
    }

    for (const idx of picks) {
        parts[idx] = OUTPUT_WORDS[Math.floor(Math.random() * OUTPUT_WORDS.length)];
    }

    return parts.join("");
}

translatebtn.addEventListener('click', () => {
    if (TRANSLATING == false) {
        TRANSLATING = true;
    };

    if (TRANSLATING == true) {
        GOTTEN_INPUT = document.getElementById("txt-input-txt").value; 
        if (GOTTEN_INPUT != "") {
            GOTTEN_OUTPUT = generate_cat_speech(GOTTEN_INPUT);
        } else {
            TRANSLATING = false;
            LOADING_AMOUNT = randint(3,5);
        }
    };
});

let prevtime = 0;
function frame(timestamp) {
    const deltatime = (timestamp - prevtime) / 1000;
    prevtime = timestamp;

    if (TRANSLATING == true) {
        loading_element.style.opacity = 0.8;
        if (LOADING_AMOUNT > 0) {
            if (VICTORY_ACTIVE == true) {
                VICTORY_ACTIVE = false;
            }
            if (SFX_ACTIVE == false) {
                SFX_ACTIVE = true;
                play_construction_sfx();
            }
            LOADING_AMOUNT = LOADING_AMOUNT - deltatime
            // console.log(LOADING_AMOUNT)
        } else {
            TRANSLATING = false;
            LOADING_AMOUNT = randint(3,5);
            loading_element.style.opacity = 0;
            translate_output.value = GOTTEN_OUTPUT;
            if (SFX_ACTIVE == true) {
                SFX_ACTIVE = false;
                stop_construction_sfx();
            }
            if (VICTORY_ACTIVE == false) {
                VICTORY_ACTIVE = true;
                play_victory()
            }
        }
    } 

    window.requestAnimationFrame(frame);
};

window.requestAnimationFrame((timestamp) => {
    prevtime = timestamp;
    window.requestAnimationFrame(frame);
});

construction_sfx.play();
playMusic();