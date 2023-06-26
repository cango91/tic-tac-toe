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

// first, let's have a function to convert our 2d representation to bitboards
/**
 * 
 * @param {Array} array - A 2D array representing the board state. Uses the convention we used in core.js -> -1 for 'O', 1 for 'X' and null for empty
 * @returns {Array} - The bitboard representation for [x,o]
 */
function arrayToBitboards(array){
    let bitboardX = 0, bitboardO = 0;
    for(let i=0;i<9;i++){
        const [rowId, colId] = [Math.floor(i/3), i%3];
        if(array[rowId][colId]===1)
            bitboardX |= (1<<i);
        else if(array[rowId][colId]===-1)
            bitboardO |= (1<<i);
    }
    return [bitboardX,bitboardO];
}
/**
 * 
 * @param {Number} bitboardX - bitboard representation of x-occupied squares
 * @param {Number} bitboardO - bitboard representation of o-occupied squares
 * @returns {Array(Number)} - 2D array representing board state, same convention as core.js
 */
function bitboardsToArray(bitboardX,bitboardO){
    const array = Array(3).fill(null).map(()=>Array(3).fill(null));
    for(let i =0;i<9;i++){
        const [rowId, colId] = [Math.floor(i/3), i%3];
        if((1<<i) & bitboardX)
            array[rowId][colId] = 1;
        else if((1<<i) & bitboardO)
            array[rowId][colId] = -1;
    }
    return array;
}