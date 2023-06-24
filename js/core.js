/*
    The core functionality of tic-tac-toe game (WIP)
*/


export default Object.freeze(class Core {
    #gameMode;
    #gameState;
    #boardState;
    #turn;
    #players;

    #checkWinConditions() {
        for (const condition of this.#winConditions) {
            const [[rowA, colA], [rowB, colB], [rowC, colC]] = condition;
            if (
                this.#boardState[rowA][colA] !== null &&
                this.#boardState[rowA][colA] === this.#boardState[rowB][colB] &&
                this.#boardState[rowB][colB] === this.#boardState[rowC][colC]
            )
                return this.#boardState[rowA][colA];
        }
        // No winner yet, return null for game-on, 0 for tie:
        return this.#boardState.every(row => row.every(cell => cell !== null)) ? 0 : null;
    }
    #winConditions = [
        // rows:
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        // columns:
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        // diagonals:
        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ];

    #initBoard() {
        // 3x3 board with all null values
        // Apparently Array(3).fill(Array(3).fill(null)) doesn't work as it sets all the rows to reference the same null array >.<
        this.#boardState = Array(3).fill(null).map(() => Array(3).fill(null));
    }

    #initState() {
        this.#gameState = Core.GameStates.initialized;
    }

    // assign playerControllers to players
    #initPlayers(xController, oController) {
        if (Object.values(Core.PlayerControllers).includes(xController) && Object.values(Core.PlayerControllers).includes(oController)) {
            this.#players = {
                [Core.Players.x]: xController,
                [Core.Players.o]: oController
            };
            return;
        }
        console.error(`Invalid PlayerController. Must be one of: Core.PlayerControllers.{${Object.keys(Core.PlayerControllers)}}`);
    }

    #setTurn(player) {
        if (Object.values(Core.Players).includes(player)) {
            this.#turn = player;
            return;
        }
        throw new this.InvalidPlayerError(`Invalid Player. Must be one of: Core.Players.{${Object.keys(Core.Players)}}`);
    }

    #InvalidPlayerError = class InvalidPlayerError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid Player Error.";
        }
    }

    publicTestFunction(...args) {
        //this.#initPlayers(args[0],args[1]);
        //this.#setTurn(args[0]);
        const boardState = args[0];
        boardState.forEach((row, rowId) => {
            row.forEach((cell, colId) => {
                try {
                    if (cell !== null)
                        this.#makeMove(cell, rowId, colId);
                } catch (error) {
                    if (error instanceof this.#InvalidPlayerError) {
                        try {
                            this.#makeMove(Symbol.for(cell), rowId, colId);
                        } catch (err) {
                            console.error("Unexpected error occured:", err);
                        }
                    }
                }
            })
        });

    }

    publicTestFunction2() {
        return this.#checkWinConditions();
    }


    constructor() {
        this.#initBoard();
    }
    static GameModes = Object.freeze({
        vsAI: Symbol('vsAI'),
        vsHuman: Symbol('vsHuman'),
    });

    static GameStates = Object.freeze({
        initialized: Symbol('intialized'),
        waitingForHuman: Symbol('waitingForHuman'),
        waitingForAI: Symbol('waitingForAI'),
        finished: Symbol('finished')
    });

    static Players = Object.freeze({
        o: -1,
        x: 1
    });

    static PlayerControllers = Object.freeze({
        ai: Symbol('ai'),
        human: Symbol('human')
    });

    static AIStrategies = Object.freeze({
        dumbo: Symbol('dumbo'),
        rando: Symbol('rando'),
        maestro: Symbol('maestro')
    });

    get gameMode() { return this.#gameMode; }

    set gameMode(val) {
        if (Object.values(Core.GameModes).includes(val)) {
            this.#gameMode = val;
            return;
        }
        console.error('Invalid Game mode!');
    }

    get boardState() { return this.#boardState; }
    get gameState() { return this.#gameState; }

    nextTurn() {

    }

    #makeMove(player, row, col) {
        if (this.#boardState[row][col] !== null) {
            console.error('Tried move on non-empty cell!');
            return;
        }
        if (Object.values(Core.Players).includes(player)) {
            this.#boardState[row][col] = player;
            return;
        }
        throw new this.#InvalidPlayerError();
    }

    get turn() { return this.#turn; }


})