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
scary_music.preload = 'auto';

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

// MAKE EVERY SOUND HAVE THEIR OWN POOL
function makePool(src, size = 3, volume = 0.3) {
	const pool = [];
	for (let i = 0; i < size; i++) {
		const a = new Audio(src);
		a.preload = 'auto';
		a.volume = volume;
		pool.push(a);
	}
	let i = 0;
	return function play(pitch = 1, vol = volume) {
		const a = pool[i];
		i = (i + 1) % pool.length;
		a.preservesPitch = false;
		a.playbackRate = pitch;
		a.volume = vol;
		try { a.currentTime = 0; } catch (e) {}
		const p = a.play();
		if (p && p.catch) p.catch(() => {});
	};
}

const playMeow = [
	makePool("../../sfx/mario-meow.mp3", 3, 0.2),
	makePool("../../sfx/meow-irl.mp3", 3, 0.2),
	makePool("../../sfx/boykisser-meow1.mp3", 3, 0.2),
	makePool("../../sfx/boykisser-meow2.mp3", 3, 0.2),
];

const playChips = makePool("../../sfx/chips.mp3", 3, 0.3);
const playGain = makePool("../../sfx/snd_select.mp3", 3, 0.3);
const playHurt = makePool("../../sfx/snd_hurt1.mp3", 3, 0.3);
const playWinYay = makePool("../../sfx/children-yay.mp3", 1, 0.5);
const playVictory = makePool("../../sfx/victory.mp3", 1, 0.5);
const playLoseAw = makePool("../../sfx/audience-aw.mp3", 1, 0.5);
const playLoseTrombone = makePool("../../sfx/sad-trombone.mp3", 1, 0.5);

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

    if (meow_count > 4) {
        txt_move_in = 1;
    };
    change_cat();
};

function lose_count(amount) {
    meow_count = meow_count - amount;
    counttxt.textContent = `${meow_count}`;
};


// FIX LOADING CATS
// instead of fetching it's image every frame every fucking click, we preload a shuffled subset once, then just swap the source (.src) between already-decoded, already-cached Image objects
let catsList = [];
let catImageCache = [];
let catCacheReady = false;
let catSwapIndex = 0;
let lastCatSwap = 0;
const CAT_SWAP_MIN_MS = 70;   // don't swap more than ~14x/sec cus we need at least SOME limit to it
const PRELOAD_COUNT = 30;

let evilCatImg = null;
let evilCatApplied = false;

async function initCats() {
    try {
        const res = await fetch('../../api/cats.json?v=' + Date.now());
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        catsList = await res.json();
        if (!Array.isArray(catsList) || !catsList.length) {
            throw new Error('No cats returned in JSON');
        }
        console.log(`Successfully loaded ${catsList.length} cats!`);
        
        // Preload the evil cat once
        const evilPath = catsList.find(p => p.endsWith('fuckyou.png'));
        if (evilPath) {
            evilCatImg = new Image();
            evilCatImg.src = '../../' + evilPath;
        }
        
        // Preload a random subset of cats
        const shuffled = [...catsList].sort(() => Math.random() - 0.5);
        const toLoad = shuffled.slice(0, Math.min(PRELOAD_COUNT, shuffled.length));
        
        await Promise.all(toLoad.map(path => new Promise(resolve => {
            const img = new Image();
            img.onload  = () => { catImageCache.push(img); resolve(); };
            img.onerror = () => resolve();
            img.src = '../../' + path;
        })));
        
        catCacheReady = catImageCache.length > 0;
        if (catCacheReady) clickercat.src = catImageCache[0].src;
    } catch (err) {
        console.error('Could not load cats:', err);
    }
}

initCats();

function change_cat() {
    if (!catCacheReady) return;

	const now = performance.now();
	if (now - lastCatSwap < CAT_SWAP_MIN_MS) return;
	lastCatSwap = now;

	let next = Math.floor(Math.random() * catImageCache.length);
	if (next === catSwapIndex && catImageCache.length > 1) {
		next = (next + 1) % catImageCache.length;
	}
	catSwapIndex = next;
	clickercat.src = catImageCache[catSwapIndex].src;
}

function change_cat_to_EVIL() {
    if (evilCatApplied || !evilCatImg) return;
	evilCatApplied = true;
	clickercat.src = evilCatImg.src;
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
    const deltatime = Math.min((timestamp - prevtime) / 1000, 0.1);
    prevtime = timestamp;

    // if (lose_count_time < 0) {
        // lose_count(1)
        // delta(lose_count_time)
        // console.log(lose_count_time)
    // }

    if (scaling > 0) {
        clickercat.style.transform = "scale(1.2)";
        scaling = scaling - deltatime;
    } else {
        clickercat.style.transform = "scale(1)";
    };

    if (txt_move_in > 0) {
        counttxt.style.transform = "translateY(-150px)";
        txt_move_in = txt_move_in - deltatime;
        // delta(txt_move_in);
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
            // dont need to damn shake
            // const shake_x_count = (Math.random() * 2 - 1) * 4;
            // counttxt.style.transform = `translateX(${shake_x_count}px)`;
            counttxt.style.color = "red";
            playHurt(randfloat(0.7, 1.0), 0.3);
            lose_count_time = lose_count_time_max_num;
        } else {
            lose_count_time = lose_count_time - deltatime;
        };

        if (make_max_count_time_faster <= 0) {
            if (lose_count_time_max_num > 0.1) {
                lose_count_time_max_num = lose_count_time_max_num - 0.02;
            }
            make_max_count_time_faster = 0.09;
        } else {
            make_max_count_time_faster = make_max_count_time_faster - deltatime;
        };

        if (TIME_TO_SURVIVE > 0) {
            // TIME_TO_SURVIVE = (TIME_TO_SURVIVE - deltatime).toFixed(2);
            TIME_TO_SURVIVE = TIME_TO_SURVIVE - deltatime
            timetosurvive_txt = TIME_TO_SURVIVE.toFixed(2)
			survivetxt.textContent = `[!!SURVIVE FOR ${timetosurvive_txt}!!]`;
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
            playWinYay(1.0, 0.5);
			playVictory(1.0, 0.5);
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
            playLoseAw(1.0, 0.5);
			playLoseTrombone(1.0, 0.5);
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
    if (game_state == 2) {
        recordClickCPS();
    };
    scaling = 0.04; // SCALE IMAGE

    // PLAY SOUNDS
    playMeow[randint(0, 3)](randfloat(0.5, 1.0), 0.2);
	playChips(randfloat(0.7, 1.0), 0.3);

    // IF OVER 24, START REMOVING COUNT, ELSE JUST CONTINUE
    if (meow_count > 24 && game_state == 0) {
        game_state = 2;
        add_count(1);
        fadeRedIn();
        SURVIVE_SHAKING = true
        counttxt.style.color = "white";
    } else {
        add_count(1);
        playGain(randfloat(0.7, 1.0), 0.3);
        counttxt.style.color = "white";
    }
});

function checkifonphoneortablet() {
    let ON_PHONE_OR_TABLET = false;
    const aww = new Audio("../../sfx/sad-trombone.mp3");
    function playexitingsfx() {
        const soundClone = aww.cloneNode();
        soundClone.volume = 0.5;
        soundClone.play();
    };

    if (/mobile/i.test(navigator.userAgent) || /ipad|tablet/i.test(navigator.userAgent)) {
        ON_PHONE_OR_TABLET = true;
        console.log("ON PHONE/TABLET")
    } else {
        ON_PHONE_OR_TABLET = false;
        console.log("ON COMPUTER/LAPTOP")
    }

    if (ON_PHONE_OR_TABLET == true) {
        playexitingsfx();
        alert("Sorry, this website (and all of it's other pages) don't support mobile/tablet, only on a computer/laptop.\n- GooberTheBall");

        window.close();
    }
}

checkifonphoneortablet();