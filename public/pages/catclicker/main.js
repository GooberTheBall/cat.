// SO MANY FUCKING VARIABLES I'LL SHIT MYSELF !!

const clickercat = document.getElementById("click-cat-img");
const clickercatBOX = document.getElementById("clicker-box");
const counttxt = document.getElementById("count-txt");
const survivetxt = document.getElementById("survive-txt");
const survivetxttime = document.getElementById("survive-txt-time");
const surviveBOX = document.getElementById("survive-box");
const wintxt = document.getElementById("win-txt");
const losetxt = document.getElementById("lose-txt");
const cpstxt = document.getElementById("best-cps-txt");
const bestcounttxt = document.getElementById("best-count-txt");

const click_mew_audio1 = new Audio("../../sfx/mario-meow.mp3");
const click_mew_audio2 = new Audio("../../sfx/meow-irl.mp3");
const click_mew_audio3 = new Audio("../../sfx/boykisser-meow1.mp3");
const click_mew_audio4 = new Audio("../../sfx/boykisser-meow2.mp3");
const chips = new Audio("../../sfx/chips.mp3");
const win = new Audio("../../sfx/children-yay.mp3");
const lose1 = new Audio("../../sfx/audience-aw.mp3");
const lose2 = new Audio("../../sfx/sad-trombone.mp3");
const victory_sound = new Audio("../../sfx/victory.mp3")
const lose_count_sfx = new Audio("../../sfx/snd_hurt1.mp3")
const gain_count_sfx = new Audio("../../sfx/snd_select.mp3")

const scary_music = new Audio("../../music/SCARY AAA.mp3")

let meow_count = 0;
let scaling = 0;
let txt_move_in = 0;
let game_state = 0;

let lose_count_time_max_num = 2;
let lose_count_time = lose_count_time_max_num;
let make_max_count_time_faster = 4;

let SURVIVE_SHAKING = false;

let TIME_TO_SURVIVE = 60; // a minute

let PLAY_SOUND_ONCE = false;
let PLAY_MUSIC_ONCE = false;

const evilTint = document.querySelector('.eviltint');
evilTintExists = evilTint !== null;

let clickTimestamps = [];
let bestCPS = 0;
const CPS_WINDOW_MS = 1000;
let CPS_SHOWN = false;

let BEST_COUNT_SHOWN = false;


function fadeRedIn() {
	if (!evilTintExists) return;

	evilTint.style = 'transition-duration: 60s; transition-timing-function: ease-out; opacity: 0.45; visibility: visible;';
};

function fadeRedOut() {
	if (!evilTintExists) return;

	evilTint.style = 'transition-duration: 0.5s; transition-timing-function: ease-out;';
};

// Jesus christ javascript PLEASE for the love of GOD add more than one fucking random function 😭🙏
function randfloat(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2)
};
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function playWithPitch(audio, pitch, vol) {
    const soundClone = audio.cloneNode();
    soundClone.preservesPitch = false;
    soundClone.playbackRate = pitch;
    soundClone.volume = vol;
    soundClone.play();
};

function playRandomizedPitch(audio) {
    const soundClone = audio.cloneNode();
    soundClone.preservesPitch = false;
    soundClone.playbackRate = randfloat(0.5,1.0);
    soundClone.volume = 0.2;
    soundClone.play();
};

function playRandomSound() {
    let rnd = randint(1,4);
    if (rnd == 1) {
        playRandomizedPitch(click_mew_audio1);
    } else if (rnd == 2) {
        playRandomizedPitch(click_mew_audio2);
    } else if (rnd == 3) {
        playRandomizedPitch(click_mew_audio3);
    } else {
        playRandomizedPitch(click_mew_audio4);
    };
};

function play_music() {
    scary_music.volume = 0.7;
    scary_music.play();
}

function stop_music() {
    if (scary_music.paused != true) {
        scary_music.pause();
    };
};

function add_count(amount) {
    meow_count = meow_count + amount;
    counttxt.textContent = `${meow_count}`;

    console.log(game_state);

    if (meow_count > 4) {
        txt_move_in = 1;
        console.log(meow_count);
    };
    change_cat();
};

function lose_count(amount) {
    meow_count = meow_count - amount;
    counttxt.textContent = `${meow_count}`;
};


// yes im doing a different way of getting the cat images, fuck you
let catsList = [];

async function initCats() {
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
}

initCats();

function change_cat() {
    if (catsList.length === 0) return; 

    let failCount = 0;
    
    function updateCat() {
        if (failCount > 5) {
            console.warn("Too many failed loads, sticking with current image.");
            failCount = 0; 
            return;
        }
        
        const randomCat = catsList[Math.floor(Math.random() * catsList.length)];
        const nextCatUrl = '../../' + randomCat + '?r=' + Date.now();
        const tempImg = new Image();
        
        tempImg.onload = () => {
            clickercat.src = nextCatUrl; 
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
}

function change_cat_to_EVIL() {
    if (catsList.length === 0) return; 

    const evilCatPath = catsList.find(path => path.endsWith('fuckyou.png'));

    if (!evilCatPath) {
        console.warn('fuckyou.png not found in cats.json');
        return;
    }

    let failCount = 0;
    
    function updateCatToEVIL() {
        if (failCount > 5) { failCount = 0; return; }
        
        const nextCatUrl = '../../' + evilCatPath + '?r=' + Date.now();
        const tempImg = new Image();
        
        tempImg.onload  = () => { clickercat.src = nextCatUrl; failCount = 0; };
        tempImg.onerror = () => {
            failCount++;
            setTimeout(updateCatToEVIL, 1500); 
        };
        
        tempImg.src = nextCatUrl;
    }
    
    updateCatToEVIL();
}


function recordClickCPS() {
    const now = performance.now();
    clickTimestamps.push(now);

    // Drop anything older than 1 second
    while (clickTimestamps.length && now - clickTimestamps[0] > CPS_WINDOW_MS) {
        clickTimestamps.shift();
    }

    // How many clicks landed in the last second?
    if (clickTimestamps.length > bestCPS) {
        bestCPS = clickTimestamps.length;
    }
}


let prevtime = 0;
function frame(timestamp) {
    const deltatime = (timestamp - prevtime) / 1000;
    prevtime = timestamp;

    function delta(time) {
        time -= deltatime;
    };

    // if (lose_count_time < 0) {
        // lose_count(1)
        // delta(lose_count_time)
        // console.log(lose_count_time)
    // }

    if (scaling > 0) {
        clickercat.style.transform = "scale(1.2)";
        scaling -= deltatime;
        delta(scaling);
    } else {
        clickercat.style.transform = "scale(1)";
    };

    if (txt_move_in > 0) {
        counttxt.style.transform = "translateY(-150px)";
        // txt_move_in -= deltatime;
        delta(txt_move_in);
    };

    if (SURVIVE_SHAKING == true) {
        const x = (Math.random() * 2 - 1) * 4;

        survivetxt.style.transform = `translateY(40px)`;
        surviveBOX.style.transform = `translateX(${x}px)`;

        // delta(SURVIVE_TEXT_IN);
    };

    // ONCE IT REACHES 0, REMOVE COUNT AND RESET THE TIMER
    if (game_state == 2) {
        if (lose_count_time <= 0) {
            lose_count(1);
            const shake_x_count = (Math.random() * 2 - 1) * 4;
            counttxt.style.transform = `translateX(${shake_x_count}px)`;
            counttxt.style.color = "red";
            playWithPitch(lose_count_sfx, randfloat(0.7,1.0), 0.3);
            lose_count_time = lose_count_time_max_num;
        } else {
            lose_count_time = lose_count_time - deltatime;
            console.log(lose_count_time);
        };

        if (make_max_count_time_faster <= 0) {
            if (lose_count_time_max_num > 0.1) {
                lose_count_time_max_num = lose_count_time_max_num - 0.02;
            }
            make_max_count_time_faster = 0.09;
        } else {
            make_max_count_time_faster = make_max_count_time_faster - deltatime;
        };

        console.log(TIME_TO_SURVIVE)
        if (TIME_TO_SURVIVE > 0) {
            survivetxt.textContent = `[!!SURVIVE FOR ${TIME_TO_SURVIVE}!!]`;
            TIME_TO_SURVIVE = (TIME_TO_SURVIVE - deltatime).toFixed(2);
        };

        if (meow_count <= 0) {
            game_state = 4; // LOSE
        } else if (TIME_TO_SURVIVE <= 0) {
            game_state = 3; // WIN
        }

        if (PLAY_MUSIC_ONCE != true) {
            PLAY_MUSIC_ONCE = true;
            play_music()
        };
    };

    if (game_state == 3) {
        fadeRedOut();
        survivetxt.style.transform = `translateY(-200px)`;
        counttxt.style.transform = "translateY(200px)";
        clickercat.style.opacity = "0";
        wintxt.style.opacity = "1";
        clickercatBOX.style.pointerEvents = "none";

        if (PLAY_SOUND_ONCE == false) {
            PLAY_SOUND_ONCE = true;
            playWithPitch(win, 1.0, 0.5);
            playWithPitch(victory_sound, 1.0, 0.5);
        };

        if (!CPS_SHOWN) {
            CPS_SHOWN = true;
            cpstxt.textContent = `Best CPS: ${bestCPS}`;
            cpstxt.style.opacity = "1";
        }

        if (!BEST_COUNT_SHOWN) {
            BEST_COUNT_SHOWN = true;
            bestcounttxt.textContent = `Best Count Amount: ${meow_count}`
            bestcounttxt.style.opacity = "1";
        }

        stop_music()
    };

    if (game_state == 4) {
        survivetxt.style.transform = `translateY(-200px)`;
        counttxt.style.transform = "translateY(200px)";
        clickercatBOX.style.pointerEvents = "none";
        losetxt.style.opacity = "1";
        change_cat_to_EVIL()

        if (PLAY_SOUND_ONCE == false) {
            PLAY_SOUND_ONCE = true;
            playWithPitch(lose1, 1.0, 0.5);
            playWithPitch(lose2, 1.0, 0.5);
        };

        stop_music()
    }

    window.requestAnimationFrame(frame);
};

window.requestAnimationFrame((timestamp) => {
    prevtime = timestamp;
    window.requestAnimationFrame(frame);
});

clickercat.addEventListener('click', () => {
    console.log('Image clicked!');
    if (game_state == 2) {
        recordClickCPS();
    };
    scaling = 0.04; // SCALE IMAGE

    // PLAY SOUNDS
    playRandomSound();
    playWithPitch(chips, randfloat(0.7,1.0), 0.3);

    // IF OVER 24, START REMOVING COUNT, ELSE JUST CONTINUE
    if (meow_count > 24 && game_state == 0) {
        game_state = 2;
        add_count(1);
        fadeRedIn();
        SURVIVE_SHAKING = true
        counttxt.style.color = "white";
    } else {
        add_count(1);
        playWithPitch(gain_count_sfx, randfloat(0.7,1.0), 0.3);
        counttxt.style.color = "white";
    }
});