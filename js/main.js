import Core from "./core.js";

// initialize variables
const header = document.querySelector('header');
const main = document.querySelector('main');

Object.keys(Core.GameModes).forEach((mode)=>main.append((el=>{el.innerText=mode;return el;})(document.createElement('h1'))));

let core = new Core('s');
console.log(core.gameMode);
