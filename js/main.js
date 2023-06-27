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
const footerEl = document.querySelector('footer');

let lastTurn;

const svgInnerO = `<circle cx="50" cy="50" r="40" stroke="black" stroke-width="5" fill="none"></circle>`;
const svgInnerX = `<line x1="20" y1="20" x2="80" y2="80" stroke="black" stroke-width="5"></line>
<line x1="20" y1="80" x2="80" y2="20" stroke="black" stroke-width="5"></line>`;

const gameModes = [Core.GameModes.vsHuman, Core.GameModes.vsAI];
const aiOpponents = [Core.AIStrategies.rando, Core.AIStrategies.dumbo, Core.AIStrategies.smarto, Core.AIStrategies.maestro];
let turn = null;
const game = new Core();
// TODO: use this when restarting to begin the same type of gamemode
let currentMode = gameModes[1];
let currentOppopnent = aiOpponents[0];


// Add event listeners
popupOverlayEl.addEventListener('click',(evt)=>{
    evt.preventDefault();
    if(evt.target.id !== "popup-overlay")
        return;
    popupOverlayEl.style.opacity = "0";
    setTimeout(()=>popupOverlayEl.classList.add('hidden'),300);
    
})
iconsEl.addEventListener('click',evt=>iconsClickListener(evt));
boardEl.addEventListener('click',evt=>boardClickListener(evt));

// Begin in multiplayer by default
//beginMultiPlayerGame();
beginSinglePlayerGame();

// Defer audio load until after game is initialized for low-bandwith mobile connections
asyncAddAudio();

function beginMultiPlayerGame(){
    game.initializeGame(gameModes[0]);
    game.nextTurn(handleGame);
}

function beginSinglePlayerGame(){
    game.initializeGame(gameModes[1],aiOpponents[0]);
    game.nextTurn(handleGame);    
}

function selfOrParentCheck(event,parentSelector){
    return event.target.matches(`${parentSelector}, ${parentSelector} *`);
}

function iconsClickListener(evt){
    if(selfOrParentCheck(evt,"#sound-off")){
        // turn on audio, hide sound-off, show sound-on
        if(!audioEl) return;
        audioEl.muted = false;
        soundOffIcon.classList.add("hidden");
        audioEl.play();
        soundOnIcon.classList.remove("hidden");

    }else if(selfOrParentCheck(evt,"#sound-on")){
        //console.log("sound on");
        if(!audioEl) return;
        audioEl.muted = true;
        soundOffIcon.classList.remove("hidden");
        soundOnIcon.classList.add("hidden");
    }else if(selfOrParentCheck(evt, "#settings")){
        showPopup();
        console.log("settings");
    }else if(selfOrParentCheck(evt,"#restart")){
        currentMode === gameModes[0] ? beginMultiPlayerGame() : beginSinglePlayerGame();
        enableBoard();
    }else{
        return;
    }
}

function boardClickListener(evt){
    evt.preventDefault();
    let squareTarget = null;
    if(evt.target.id && evt.target.id.substring(0,2)==='sq'){
        squareTarget = evt.target;
    }else if(evt.target.parentNode.id && evt.target.parentNode.id.substring(0,2)==='sq'){
        squareTarget = evt.target.parentNode;
    }else{
        return;
    }
    if(turn === 1) game.nextTurn(handleGame,squareTarget.id[2],squareTarget.id[3]).then(()=>console.log("move sent")).catch((err)=>console.log(err));
}


function handleGame(turnState){
    //console.log(turnState);
    const msg ={};
    // if game is finished
    if(turnState.gameState === Core.GameStates.finished){
        disableBoard();
        if(turnState.winState.winner){
            msg.color = "var(--win-color)";
            msg.text = `<b>Player ${turnState.winState.winner>0 ? 'X' : 'O'} WINS!</b>`;
        }else{
            msg.text = "<b>It's a tie &#10707;</b>";
            msg.color = "brown";
        }
    }else if(turnState.gameState === Core.GameStates.waitingForHuman){
        // set turn
        turn = turnState.turn;
        boardEl.classList.remove('ai-turn');
    }
    if(turnState.gameState !== Core.GameStates.finished){
        msg.text = `Player <b>${turn === -1 ? 'O' : 'X'}</b> turn`
    }
    

    if(turnState.gameState === Core.GameStates.waitingForAI){
        turn = turnState.turn;
        boardEl.classList.add("ai-turn");
        msg.text = `Player <b>${turn === -1 ? 'O' : 'X'}</b> turn`
        game.nextTurn(handleGame)
            .then(()=>console.log("AI has made its move"))
            .catch((err)=>console.log(err));
    }
    render(turnState.boardState,msg,turnState.winState.winningCondition);
}


function render(boardState,msg,winCondtion = null){
    renderStatus(msg);
    renderBoard(boardState);
    if(winCondtion)
        paintWinCondition(winCondtion);
}

function paintWinCondition(winCondition){
    winCondition.forEach((coord)=>{
        boardEl.querySelectorAll(`#sq${String(coord[0])+String(coord[1])}`).forEach(cell => cell.classList.add('animated-winner'));
        let winningSquare = boardEl.querySelectorAll(`#sq${String(coord[0])+String(coord[1])}>svg>*`);
        winningSquare.forEach(line=>line.setAttribute('stroke','red'));
    })
}

function renderStatus(msg){
    spanEl.style.color = msg.color ? msg.color : 'black';
    spanEl.innerHTML=`${msg.text}`;
}

function disableBoard(){
    boardEl.classList.add('disabled');
    for(const child of boardEl.children){
        child.classList.add('disabled');
    }
}

function enableBoard(){
    boardEl.classList.remove('disabled');
    for(const child of boardEl.children){
        child.classList.remove('disabled');
        child.classList.remove('animated-winner');
    }
}

function renderBoard(boardState){
    boardState.forEach((row, rowId)=>{
        row.forEach((cell, colId)=>{
            let sq = boardEl.querySelector(`#sq${rowId}${colId}`);
            if(cell!==null){
                sq.classList.add('filled');
                ((square)=>draw(cell,square))(sq.querySelector('svg'));
            }else{
                sq.classList.remove('filled');
                sq.querySelector('svg').innerHTML = '';
            }
            
        })
    })
}

function draw(player,cell){
    switch(player){
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

function showPopup(){
    populatePopupDynamicFields();
    popupOverlayEl.classList.remove("hidden");
    setTimeout(()=>popupOverlayEl.style.opacity = "1",1);
}

function populatePopupDynamicFields(){
    const modeText = popupOverlayEl.querySelector("#popup-game-mode-text");
    modeText.innerText = currentMode === gameModes[0] ? "against another human" : "against computer";
}

function asyncAddAudio(){
    const audio = document.createElement('audio');
    audio.src = "assets/chill-abstract-intention-12099.mp3";
    audio.muted = true;
    audio.controls = false;
    audio.autoplay = false;
    audio.loop = true;
    audio.style.display='none';

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