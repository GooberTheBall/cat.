// API BTN
const btn = document.getElementById("api-btn")
btn.addEventListener('click', (ev) => {
    window.location.href = "https://cat.portbuddy.dev/api/cats";
})

// MEW BTN
const mew = document.getElementById("mew-btn")
const mew_audio = new Audio("sfx/mario-meow.mp3")
mew_audio.volume = 0.5

function meow() {
    const soundClone = mew_audio.cloneNode();
    soundClone.volume = 0.5;
    
    soundClone.play().catch(e => {});
}

mew.addEventListener('click', (ev) => {
    meow() // OwO 
})

// 👀 BTN
if(!localStorage.getItem('fear')){
    localStorage.setItem('fear', false);
}
const scary = document.getElementById("scary-btn")
scary.addEventListener('click', (ev) => {
    localStorage.setItem('fear', true);
    window.location.replace("https://cat.portbuddy.dev/fear/");
})

// const exe = document.getElementById("exe-btn");
// exe.addEventListener("click", () => {
    // window.location.replace("https://cat.portbuddy.dev/exe/");
// });

window.adjustButtonPositions = function() {
    const redP = document.getElementById('red_p');
    const apiBtn = document.getElementById('api-btn');
    const mewBtn = document.getElementById('mew-btn');
    const scaryBtn = document.getElementById('scary-btn');
    const togglemusicbtn = document.getElementById('toggle-music-btn');
    // const exebtn = document.getElementById('exe-btn');
    
    // If #red_p exists, shift the buttons up by 40px
    const offset = redP ? 40 : 0;
    
    var fear_values = localStorage.getItem('fear');
    console.log(fear_values)
    if (fear_values == "true") {
        scaryBtn.style.bottom = (80 + offset) + "px";
        scaryBtn.style.visibility = "hidden";
        
        apiBtn.style.bottom = (0 + offset) + "px";
        mewBtn.style.bottom = (40 + offset) + "px";
        togglemusicbtn.style.bottom = (80 + offset) + "px";
    } else {
        apiBtn.style.bottom = (0 + offset) + "px";
        mewBtn.style.bottom = (40 + offset) + "px";
        scaryBtn.style.bottom = (80 + offset) + "px";
        togglemusicbtn.style.bottom = (120 + offset) + "px";
    }
}

window.adjustButtonPositions();