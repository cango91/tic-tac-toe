import Core from "./core.js";

// Declare and initialize variables
const headerEl = document.querySelector('header');
const mainEl = document.querySelector('main');
const boardEl = mainEl.querySelector('#board');
const spanEl = headerEl.querySelector('#status').querySelector('#status-text');
const iconsEl = headerEl.querySelector('.icons');
let audioEl;

const soundOffIcon = iconsEl.querySelector("#sound-off");
const soundOnIcon = iconsEl.querySelector("#sound-on");

const popupOverlayEl = document.querySelector('#popup-overlay');
const popupCloseBtnEl = popupOverlayEl.querySelector("#popup-close-btn");
const modeText = popupOverlayEl.querySelector("#popup-game-mode-text");
const toggleOn = popupOverlayEl.querySelector("#popup-toggle-game-mode-btn-on");
const toggleOff = popupOverlayEl.querySelector("#popup-toggle-game-mode-btn-off");
const aiSymbolEl = popupOverlayEl.querySelector("#ai-symbol");
const vsAiText = popupOverlayEl.querySelector("#popup-vs-ai");
const vsHumanText = popupOverlayEl.querySelector("#popup-vs-human");
const aiOptions = popupOverlayEl.querySelector("#ai-options");
const aiOpponentsEl = popupOverlayEl.querySelector("#ai-opponents");
const popupApplyBtn = popupOverlayEl.querySelector("#apply-btn");


const footerEl = document.querySelector('footer');

let lastTurn;

const svgInnerO = `<circle cx="50" cy="50" r="40" stroke="black" stroke-width="5" fill="none"></circle>`;
const svgInnerX = `<line x1="20" y1="20" x2="80" y2="80" stroke="black" stroke-width="5"></line>
<line x1="20" y1="80" x2="80" y2="20" stroke="black" stroke-width="5"></line>`;

const gameModes = [Core.GameModes.vsHuman, Core.GameModes.vsAI];
const aiOpponents = [Core.AIStrategies.rando, Core.AIStrategies.dumbo, Core.AIStrategies.smarto, Core.AIStrategies.maestro];
const symbols = { x: 1, o: -1 };
let turn = null;
const game = new Core();

let defaultMode = gameModes[0];
let defaultOpponent = aiOpponents[0];
let defaultAiSymbol = symbols.o;
const gameOptions = {
    gameMode: defaultMode,
    opponent: defaultOpponent,
    aiSymbol: defaultAiSymbol
};
let previousOptions = {};

// Add event listeners
popupOverlayEl.addEventListener('click', (evt) => {
    evt.preventDefault();
    if (
        evt.target.id !== "popup-overlay" &&
        evt.target.id !== "popup-close-btn" &&
        evt.target.parentNode.id !== "popup-close-btn" &&
        evt.target.parentNode.parentNode.id !== "popup-close-btn" &&
        evt.target.id !== "apply-btn" && 
        evt.target.parentNode.id !== "apply-btn"
    ) {
        if ( selfOrParentCheck(evt,"#popup-toggle-game-mode-btn-on") || 
                selfOrParentCheck(evt,"#popup-toggle-game-mode-btn-off")
            // evt.target.id === "popup-toggle-game-mode-btn-on" ||
            // evt.target.id === "popup-toggle-game-mode-btn-off" ||
            // evt.target.parentNode.id === "popup-toggle-game-mode-btn-on" ||
            // evt.target.parentNode.id === "popup-toggle-game-mode-btn-off" ||
            // evt.target.parentNode.parentNode.id === "popup-toggle-game-mode-btn-on" ||
            // evt.target.parentNode.parentNode.id === "popup-toggle-game-mode-btn-off"
        ) {
            toggleAIOptions();
            showApplyChangesBtn(optionsChanged());
        }
        if(selfOrParentCheck(evt,"#ai-symbol")||selfOrParentCheck(evt,"#click-to-toggle")){
            toggleAISymbol();
            showApplyChangesBtn(optionsChanged());
        }
        
        return;
    }
    popupOverlayEl.style.opacity = "0";
    setTimeout(() => popupOverlayEl.classList.add('hidden'), 300);
    if(evt.target.id === "apply-btn" || evt.target.parentNode.id === "apply-btn"){
        return new Promise((res)=>{
            beginGame();
            enableBoard();
            res();
        });
    }else{
    if (optionsChanged())
        deepCopyOptions(previousOptions, gameOptions);
    }

})
iconsEl.addEventListener('click', evt => iconsClickListener(evt));
boardEl.addEventListener('click', evt => boardClickListener(evt));


beginGame();
// Defer audio load until after game is initialized for low-bandwith mobile connections
asyncAddAudio();

function beginGame(){
    game.initializeGame(gameOptions.gameMode, gameOptions.opponent, gameOptions.aiSymbol);
    game.nextTurn(handleGame);
}

function selfOrParentCheck(event, parentSelector) {
    return event.target.matches(`${parentSelector}, ${parentSelector} *`);
}

function iconsClickListener(evt) {
    if (selfOrParentCheck(evt, "#sound-off")) {
        if (!audioEl) return;
        audioEl.muted = false;
        soundOffIcon.classList.add("hidden");
        audioEl.play();
        soundOnIcon.classList.remove("hidden");
    } else if (selfOrParentCheck(evt, "#sound-on")) {
        if (!audioEl) return;
        audioEl.muted = true;
        soundOffIcon.classList.remove("hidden");
        soundOnIcon.classList.add("hidden");
    } else if (selfOrParentCheck(evt, "#settings")) {
        showApplyChangesBtn(false);
        showPopup();
    } else if (selfOrParentCheck(evt, "#restart")) {
        beginGame();
        enableBoard();
    } else {
        return;
    }
}

function boardClickListener(evt) {
    evt.preventDefault();
    let squareTarget = null;
    if (evt.target.id && evt.target.id.substring(0, 2) === 'sq') {
        squareTarget = evt.target;
    } else if (evt.target.parentNode.id && evt.target.parentNode.id.substring(0, 2) === 'sq') {
        squareTarget = evt.target.parentNode;
    } else {
        return;
    }
    if ((gameOptions.gameMode == gameModes[1] && turn !== gameOptions.aiSymbol)||gameOptions.gameMode===gameModes[0])
        game.nextTurn(handleGame, squareTarget.id[2], squareTarget.id[3]).catch((err) => console.log(err));

}


function handleGame(turnState) {
    const msg = {};
    // if game is finished
    if (turnState.gameState === Core.GameStates.finished) {
        disableBoard();
        if (turnState.winState.winner) {
            msg.color = "var(--win-color)";
            msg.text = `<b>Player ${turnState.winState.winner > 0 ? 'X' : 'O'} WINS!</b>`;
        } else {
            msg.text = "<b>It's a tie &#10707;</b>";
            msg.color = "brown";
        }
    } else if (turnState.gameState === Core.GameStates.waitingForHuman) {
        // set turn
        turn = turnState.turn;
        boardEl.classList.remove('ai-turn');
    }
    if (turnState.gameState !== Core.GameStates.finished) {
        msg.text = `Player <b>${turn === -1 ? 'O' : 'X'}</b> turn`
    }


    if (turnState.gameState === Core.GameStates.waitingForAI) {
        turn = turnState.turn;
        boardEl.classList.add("ai-turn");
        msg.text = `Player <b>${turn === -1 ? 'O' : 'X'}</b> turn`
        game.nextTurn(handleGame).catch((err) => console.log(err));
    }
    render(turnState.boardState, msg, turnState.winState.winningCondition);
}


function render(boardState, msg, winCondtion = null) {
    renderStatus(msg);
    renderBoard(boardState);
    if (winCondtion)
        paintWinCondition(winCondtion);
}

function paintWinCondition(winCondition) {
    winCondition.forEach((coord) => {
        boardEl.querySelectorAll(`#sq${String(coord[0]) + String(coord[1])}`).forEach(cell => cell.classList.add('animated-winner'));
        let winningSquare = boardEl.querySelectorAll(`#sq${String(coord[0]) + String(coord[1])}>svg>*`);
        winningSquare.forEach(line => line.setAttribute('stroke', 'red'));
    })
}

function renderStatus(msg) {
    spanEl.style.color = msg.color ? msg.color : 'black';
    spanEl.innerHTML = `${msg.text}`;
}

function disableBoard() {
    boardEl.classList.add('disabled');
    for (const child of boardEl.children) {
        child.classList.add('disabled');
    }
}

function enableBoard() {
    boardEl.classList.remove('disabled');
    for (const child of boardEl.children) {
        child.classList.remove('disabled');
        child.classList.remove('animated-winner');
    }
}

function renderBoard(boardState) {
    boardState.forEach((row, rowId) => {
        row.forEach((cell, colId) => {
            let sq = boardEl.querySelector(`#sq${rowId}${colId}`);
            if (cell !== null) {
                sq.classList.add('filled');
                ((square) => draw(cell, square))(sq.querySelector('svg'));
            } else {
                sq.classList.remove('filled');
                sq.querySelector('svg').innerHTML = '';
            }

        })
    })
}

function draw(player, cell) {
    switch (player) {
        case Core.Players.x:
            cell.innerHTML = svgInnerX;
            break;
        case Core.Players.o:
            cell.innerHTML = svgInnerO;
            break;
        default:
            console.error("Can't draw");
    }
}

function showPopup() {
    cacheCurrentOptions();
    populatePopupDynamicFields();
    popupOverlayEl.classList.remove("hidden");
    setTimeout(() => popupOverlayEl.style.opacity = "1", 1);
}

function hidePopup() {

}

function populatePopupDynamicFields() {
    switch (previousOptions.gameMode) {
        case gameModes[0]:
            modeText.innerText = "against another human";
            toggleAIOptions(false);
            break;
        case gameModes[1]:
            modeText.innerText = "against computer";
            toggleAIOptions(true);
            break;
    }
    toggleAISymbol(gameOptions.aiSymbol);
}

function asyncAddAudio() {
    const audio = document.createElement('audio');
    audio.src = "assets/chill-abstract-intention-12099.mp3";
    audio.muted = true;
    audio.controls = false;
    audio.autoplay = false;
    audio.loop = true;
    audio.style.display = 'none';

    const link = document.createElement('a');
    link.href = "assets/chill-abstract-intention-12099.mp3";
    link.innerText = "direct link";

    const text = document.createTextNode("Your browser doesn't seem to support <audio> tags. Here is a ");
    audio.appendChild(text);
    audio.appendChild(link);
    audio.appendChild(document.createTextNode(" to the .mp3 file if you want to listen to it while playing"));

    audio.oncanplaythrough = () => {
        footerEl.querySelector("#music-attribution").classList.remove("hidden");
        soundOffIcon.classList.remove("hidden");
    }

    audio.onerror = () => console.log("Audio load failed");
    footerEl.appendChild(audio);
    audioEl = audio;
}
function deepCopyOptions(from, to) {
    Object.keys(from).forEach((key) => {
        switch (key) {
            case 'gameMode':
                for (let mode of gameModes) {
                    if (mode === from[key]) {
                        to[key] = mode;
                        break;
                    }
                }
                break;
            case 'opponent':
                for (let opponent of aiOpponents) {
                    if (opponent === from[key]) {
                        to[key] = opponent;
                        break;
                    }
                }
                break;
            case 'aiSymbol':
                for (let symbol of Object.values(symbols)) {
                    if (symbol === from[key]) {
                        to[key] = symbol;
                        break;
                    }
                }
                break;
        }
    });
}
function cacheCurrentOptions() {
    deepCopyOptions(gameOptions, previousOptions)
}

function optionsChanged() {
    for (let key of Object.keys(gameOptions))
        if (gameOptions[key] !== previousOptions[key])
            return true;

    return false;
}

function toggleAIOptions(show = null) {
    if (show === false || !!(show === null && aiOptions.style.opacity === "1")) {
        aiOptions.style.opacity = "0";
        toggleOff.classList.remove("hidden");
        toggleOn.classList.add("hidden");
        vsAiText.classList.add("popup-soft");
        vsHumanText.classList.remove("popup-soft");
        gameOptions.gameMode = gameModes[0];
        setTimeout(() => aiOpponentsEl.classList.add("hidden"), 300);
    } else if (show === true || (show === null && aiOptions.style.opacity === "0")) {
        aiOptions.classList.remove("hidden");
        aiOptions.style.opacity = "1";
        toggleOff.classList.add("hidden");
        toggleOn.classList.remove("hidden");
        vsAiText.classList.remove("popup-soft");
        vsHumanText.classList.add("popup-soft");
        gameOptions.gameMode = gameModes[1];
        aiOpponentsEl.classList.remove("hidden");
    }
}

function toggleAISymbol(sym=null){
    const svg = aiSymbolEl.querySelector("svg");
    const symbolToShow = sym ? sym : gameOptions.aiSymbol *-1;
    svg.style.color="white";
    svg.innerHTML = symbolToShow > 0 ? svgInnerX : svgInnerO;
    for(let ch of svg.children){
        ch.style.strokeWidth = "15";
    }
    if (!sym) gameOptions.aiSymbol *= -1;
}

function showApplyChangesBtn(show = false) {
    if (show)
        popupApplyBtn.classList.remove("hidden");
    else
        popupApplyBtn.classList.add("hidden");
}

function showAIOpponentDetails() {

}