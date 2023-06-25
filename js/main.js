import Core from "./core.js";

// initialize variables
const headerEl = document.querySelector('header');
const mainEl = document.querySelector('main');

const boardEl = mainEl.querySelector('#board');

const svgInnerO = `<circle cx="50" cy="50" r="40" stroke="black" stroke-width="5" fill="none"></circle>`;
const svgInnerX = `<line x1="20" y1="20" x2="80" y2="80" stroke="black" stroke-width="5"></line>
<line x1="20" y1="80" x2="80" y2="20" stroke="black" stroke-width="5"></line>`;

boardEl.querySelector('#sq22>svg').innerHTML=svgInnerX;
//boardEl.querySelector('#sq11>svg').innerHTML=svgInnerX;

//boardEl.querySelector('#sq00>svg').innerHTML='';

//Object.keys(Core.GameModes).forEach((mode)=>main.append((el=>{el.innerText=mode;return el;})(document.createElement('h1'))));


// testing
let core = new Core(Core.GameModes.vsAI);
console.log(core.gameMode);
//core.publicTestFunction(Core.PlayerControllers.ai,Core.PlayerControllers);
const boardState = [
    [1, -1, null],
    [null, -1 ,null],
    [null,-1, 1]
];

core.publicTestFunction(boardState);
console.log(core.boardState);
const winCondition = core.publicTestFunction2();
console.log(winCondition);

winCondition.winningCondition.forEach((coord)=>{
    let winningSquare = boardEl.querySelectorAll(`#sq${String(coord[0])+String(coord[1])}>svg>*`);
    winningSquare.forEach(line => line.setAttribute('stroke','red'));
})

const audio = document.querySelector('audio');

const muteBtnEl = document.querySelector('#sound-off');
const unMuteBtnEl = document.querySelector('#sound-on');

unMuteBtnEl.addEventListener('click',()=>{
    audio.muted = true;
    unMuteBtnEl.style.display  = 'none';
    muteBtnEl.style.display = 'inline-block';
});
muteBtnEl.addEventListener('click', () =>{
    audio.muted=false;
    audio.play();
    unMuteBtnEl.style.display  = 'inline-block';
    muteBtnEl.style.display = 'none';
});

setTimeout(() => {
    headerEl.querySelector('#status-text').innerHTML=`<small>O wins</small>`
}, 1000);