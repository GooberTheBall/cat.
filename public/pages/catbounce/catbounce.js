const bouncer = document.getElementById('bouncer');
const catImg  = document.getElementById('cat');
const yaySound = new Audio('../../sfx/yay.mp3');

let x = Math.floor(Math.random() * (600 - 800 + 1)) + 800, y = Math.floor(Math.random() * (600 - 800 + 1)) + 800;
let vx = 2, vy = 2;

let inCornerZone = false; 

function pickNewDirection() {
  //const speed = 1.5 + Math.random() * 2;
  const speed = 1.5 * 2;
  const angle = Math.random() * Math.PI * 2;
  vx = Math.cos(angle) * speed;
  vy = Math.sin(angle) * speed;
}

function bounceLoop() {
    const maxX = bouncer.clientWidth - catImg.offsetWidth;
    const maxY = bouncer.clientHeight - catImg.offsetHeight;

    x += vx;
    y += vy;

    let hitWall = false;
    if (x < 0) { 
        x = 0;
        hitWall = true;
    }
    if (x > maxX) { 
        x = maxX;
        hitWall = true;
    }
    if (y < 0) {
        y = 0;
        hitWall = true;
    }
    if (y > maxY) {
        y = maxY;
        hitWall = true;
    }

    if (hitWall) {
        pickNewDirection();
        // Force the new velocity to point away from whatever wall we hit
        if (x === 0 && vx < 0) vx = -vx;
        if (x === maxX && vx > 0) vx = -vx;
        if (y === 0 && vy < 0) vy = -vy;
        if (y === maxY && vy > 0) vy = -vy;
    }

    const zone = 1; 
    
    const inTopLeft = (x < zone && y < zone);
    const inTopRight = (x > maxX - zone && y < zone);
    const inBottomLeft = (x < zone && y > maxY - zone);
    const inBottomRight = (x > maxX - zone && y > maxY - zone);

    const isInAnyCorner = inTopLeft || inTopRight || inBottomLeft || inBottomRight;

    if (isInAnyCorner) {
        if (!inCornerZone) {
            playYay();
            inCornerZone = true;
        }
    } else {
        // Reset the flag once the cat leaves the corner
        inCornerZone = false; 
    }

    catImg.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(bounceLoop);
}

function playYay() {
    // Clone the audio so rapid corner hits don't cut each other off
    const soundClone = yaySound.cloneNode();
    soundClone.volume = 0.5;

    const policy = navigator.getAutoplayPolicy?.("mediaelement") || "unknown";
    console.log("Current autoplay policy:", policy);
    if (policy != "allowed-muted" && policy != "disallowed") {
        soundClone.play().catch(e => {});
    } else {
        console.warn("Autoplay blocked!", policy);
        return
    }
}

function checkifonphoneortablet() {}
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
        play_sfx();
        alert("Sorry, this website (and all of it's other pages) don't support mobile/tablet, only on a computer/laptop.\n- GooberTheBall");

        window.close();
    }

checkifonphoneortablet(); // running this here because this is what this website loads first

// wait for the page to fully load before starting the bounce loop
window.addEventListener('load', () => {
    pickNewDirection();
    bounceLoop();
});