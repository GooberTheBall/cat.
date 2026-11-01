function checkifonphoneortablet() {
    let ON_PHONE_OR_TABLET = false;
    const aww = new Audio("sfx/sad-trombone.mp3");
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

checkifonphoneortablet()