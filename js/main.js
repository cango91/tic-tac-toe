import Core from "./core.js";

// initialize DOM ref. variables
const headerEl = document.querySelector('header');
const mainEl = document.querySelector('main');
const boardEl = mainEl.querySelector('#board');
const spanEl = headerEl.querySelector('#status').querySelector('#status-text');
const iconsEl = headerEl.querySelector('.icons');
const audio = document.querySelector('audio');

const soundOffIcon = iconsEl.querySelector("#sound-off");
const soundOnIcon = iconsEl.querySelector("#sound-on");

let lastTurn;

if(audio.muted){
    soundOnIcon.style.display = "none";
    soundOffIcon.style.display = "inline-block";
}else{
    soundOnIcon.style.display = "inline-block";
    soundOffIcon.style.display = "none";
}

iconsEl.addEventListener('click',evt=>iconsClickListener(evt));
boardEl.addEventListener('click',evt=>boardClickListener(evt));

const svgInnerO = `<circle cx="50" cy="50" r="40" stroke="black" stroke-width="5" fill="none"></circle>`;
const svgInnerX = `<line x1="20" y1="20" x2="80" y2="80" stroke="black" stroke-width="5"></line>
<line x1="20" y1="80" x2="80" y2="20" stroke="black" stroke-width="5"></line>`;


const gameModes = [Core.GameModes.vsHuman, Core.GameModes.vsAI];
let turn = null;
const game = new Core();
//let game;
// TODO: use this when restarting to begin the same type of gamemode
let currentMode = gameModes[0];

function beginMultiPlayerGame(){
    //game = new Core();
    game.initializeGame(gameModes[0]);
    game.nextTurn(handleGame);
    
}
//console.log(game.publicTestFunction2());

beginMultiPlayerGame();

function selfOrParentCheck(event,parentSelector){
    return event.target.matches(`${parentSelector}, ${parentSelector} *`);
}

function iconsClickListener(evt){
    if(selfOrParentCheck(evt,"#sound-off")){
        // turn on audio, hide sound-off, show sound-on
        audio.muted = false;
        soundOffIcon.style.display="none";
        audio.play();
        soundOnIcon.style.display="inline-block";

    }else if(selfOrParentCheck(evt,"#sound-on")){
        //console.log("sound on");
        audio.muted = true;
        soundOffIcon.style.display = "inline-block";
        soundOnIcon.style.display = "none";
    }else if(selfOrParentCheck(evt, "#settings")){
        console.log("settings");
    }else if(selfOrParentCheck(evt,"#restart")){
        currentMode === gameModes[0] ? beginMultiPlayerGame() : console.log('not implemented');
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
    lastTurn = turn;
    game.nextTurn(handleGame,squareTarget.id[2],squareTarget.id[3]);
}


function handleGame(turnState){
    //console.log(turnState);
    // console.log(game.arrayToBitboards(turnState.boardState));
    // console.log(game.bitboardsToArray(...game.arrayToBitboards(turnState.boardState)));
    console.log(game.minimax(...game.arrayToBitboards(turnState.boardState), lastTurn === 1 ? true : false));
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
    }else if(turnState.gameState === Core.GameStates.waitingForAI){
        // TODO: Set boardEl and child div's .style.cursor to waiting, also handle disabled clicking
    }else if(turnState.gameState === Core.GameStates.waitingForHuman){
        // set turn
        turn = turnState.turn;
        msg.text = `Player <b>${turn === -1 ? 'O' : 'X'}</b> turn`
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