/*
THE IDEA:
Not accounting for symmetries and game-over conditions, but taking turn orders into consideration the tic-tac-toe game would have ~9! ~380k board states.
Accounting for game-over conditions, this number drops roughly to ~255k.
Running a recursive minimax algorithm each and every game, would result in 255k state calculations per game on a worst case scenario where the AI has the first move.
To reduce this computational load, we can create a transpositional table (a minimax lookup) ONCE, store it statically and have the AI lookup board states from them to make decisions.

This would increase memory requirement slightly, but reduce computational load greatly.

Accounting for board symmetries and reflexive symmetries, we should be able to reduce the 255k number further. Keyword: bitboards

Assuming one table is enough, for the two agents (dumbo and maestro), the memory requirement should be ~19-40k bytes. Not sure about any of the numbers.

Down the rabbit hole, WE, GO!
*/

import Core from './core.js';

const core = new Core();

// Here is our win conditions:
const winConditions = [7, 56, 448, 73, 146, 292, 273, 84];
const tieCondition = 511;

