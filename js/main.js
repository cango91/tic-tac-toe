import Core from "./core.js";

// initialize variables
const header = document.querySelector('header');
const main = document.querySelector('main');

Object.keys(Core.GameModes).forEach((mode)=>main.append((el=>{el.innerText=mode;return el;})(document.createElement('h1'))));


// testing
let core = new Core(Core.GameModes.vsAI);
console.log(core.gameMode);
//core.publicTestFunction(Core.PlayerControllers.ai,Core.PlayerControllers);
const boardState = [
    [-1, 1, -1],
    [-1, 1 ,-1],
    [1,-1,1]
];

core.publicTestFunction(boardState);
console.log(core.boardState);
console.log(core.publicTestFunction2());