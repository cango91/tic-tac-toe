/*
    The core functionality of tic-tac-toe game (WIP)
*/
export default Object.freeze(class Core {
    /* Private Fields */
    #gameMode;
    #gameState;
    #boardState;
    #turn;
    #players;
    /*  Static Fields (as enums) */

    /**
     * Enum for Game Modes
     */
    static GameModes = Object.freeze({
        /** Single player */
        vsAI: Symbol('vsAI'),
        /** Two players */
        vsHuman: Symbol('vsHuman'),
    });

    /**
     * Enum for Game States
     */
    static GameStates = Object.freeze({
        initialized: Symbol('intialized'),
        waitingForHuman: Symbol('waitingForHuman'),
        waitingForAI: Symbol('waitingForAI'),
        finished: Symbol('finished')
    });
    /**
     * Enum for Players
     */
    static Players = Object.freeze({
        o: -1,
        x: 1
    });

    /**
     * Enum for Player Controllers
     */
    static PlayerControllers = Object.freeze({
        ai: Symbol('ai'),
        human: Symbol('human')
    });

    /**
     * Enum for AI difficulties
     */
    static AIStrategies = Object.freeze(/**@lends Core.AIStrategies */{
        /** Easiest - will try to make other player win */
        dumbo: Symbol('dumbo'),
        /** Random - will always choose random */
        rando: Symbol('rando'),
        /** Hardest - will always tie or win */
        maestro: Symbol('maestro')
    });

    /* Public Getters and Setters */
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
    get turn() { return this.#turn; }

    /* Private Methods */
    #checkWinConditions() {
        for (const condition of this.#winConditions) {
            const [[rowA, colA], [rowB, colB], [rowC, colC]] = condition;
            if (
                this.#boardState[rowA][colA] !== null &&
                this.#boardState[rowA][colA] === this.#boardState[rowB][colB] &&
                this.#boardState[rowB][colB] === this.#boardState[rowC][colC]
            )
                return { winner: this.#boardState[rowA][colA], winningCondition: condition };
        }
        // No winner yet, return null for game-on, 0 for tie:
        return this.#boardState.every(row => row.every(cell => cell !== null)) ? { winner: 0, winningCondition: null } : { winner: null, winningCondition: null };
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

    #initPlayers(xController, oController) {
        if (Object.values(Core.PlayerControllers).includes(xController) && Object.values(Core.PlayerControllers).includes(oController)) {
            this.#players = {
                [Core.Players.x]: xController,
                [Core.Players.o]: oController
            };
            return;
        }
        // console.error(`Invalid PlayerController. Must be one of: Core.PlayerControllers.{${Object.keys(Core.PlayerControllers)}}`);
        throw new this.#InvalidPlayerControllerError(`Player controller must be one of Core.PlayerControllers.{${Object.keys(Core.PlayerControllers)}}`);
    }

    #setTurn(player) {
        if (Object.values(Core.Players).includes(player)) {
            this.#turn = player;
            return;
        }
        throw new this.#InvalidPlayerError(`Invalid Player. Must be one of: Core.Players.{${Object.keys(Core.Players)}}`);
    }


    #initBoard() {
        // 3x3 board with all null values
        // Apparently Array(3).fill(Array(3).fill(null)) doesn't work as it sets all the rows to reference the same null array >.<
        this.#boardState = Array(3).fill(null).map(() => Array(3).fill(null));
    }

    #initState() {
        this.#gameState = Core.GameStates.initialized;
    }

    #makeMove(player, row, col) {
        // this is an unnecessary test (therefore the OutOfTurnError is unnecessary) since we track #turn internally and don't accept a player argument from the main.js (controller)
        // if(player !== this.#turn){
        //     throw new this.#OutOfTurnError(`Player ${player > 0 ? 'X' : 'O'} tried to make a move, but it's not their turn`);
        // }
        if (this.#boardState[row][col] !== null) {
            throw new this.#IllegalMoveError(`Can't make a move on cell ${row},${col}, it is already occupied by ${this.#boardState[row][col]}`);
        }
        if (Object.values(Core.Players).includes(player)) {
            this.#boardState[row][col] = player;
            return;
        }
        throw new this.#InvalidPlayerError();
    }

    /* Custom Error Classes */
    
    #InvalidPlayerError = class InvalidPlayerError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid Player Error";
        }
    }

    // This error doesn't make sense currently. Keeping it just in case I need it when implementing vsAI, but probably won't
    #OutOfTurnError = class OutOfTurnError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Out of Turn Error";
        }
    }

    #InvalidGameStateError = class InvalidGameStateError extends Error{
        constructor(msg){
            super(msg);
            this.name = "Invalid Game State Error";
        }
    }

    #NotImplementedError = class NotImplementedError extends Error{
        constructor(msg){
            super(msg);
            this.name = "Not Implemented Error";
        }
    }

    #IllegalMoveError = class IllegalMoveError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Illegal Move Error";
        }
    }

    #InvalidPlayerControllerError = class InvalidPlayerControllerError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid Player Controller";
        }
    }

    #InvalidGameModeError = class InvalidGameModeError extends Error{
        constructor(msg){
            super(msg);
            this.name = "Invalid Game Mode";
        }
    }

    /* Public Methods */
    constructor() {
        this.#initBoard();
    }

    /**
     * (Re-)initializes the game for the provided mode
     * @param {Symbol} mode - game mode to initialize: must be a valid Symbol from Core.GameModes
     */
    initializeGame(mode){
        switch(mode){
            case Core.GameModes.vsHuman:
                this.#gameMode = mode;
                this.#initPlayers(Core.PlayerControllers.human,Core.PlayerControllers.human);
                break;
            case Core.GameModes.vsAI:
                throw new this.#NotImplementedError("This feature is not yet implemented");
            default:
                throw new this.#InvalidGameModeError(`Game mode must be one of Core.GameModes.{${Object.keys(Core.GameModes)}}`);
        }
        this.#initBoard();
        this.#initState();
    }

    publicTestFunction2() {
        return this.#checkWinConditions();
    }
    /**
     * 
     * @param {Function} callback the callback function that handles the next state of the game
     * Its parameter should an object with members: gameState, boardState, turn, winState{winner, winningCondition}
     * @param  {...any} move row, col for next move. Can be null if it's AI's turn.
     */
    nextTurn(callback,...move) {
        switch(this.#gameMode){
            case Core.GameModes.vsHuman:
                switch(this.#gameState){
                    case Core.GameStates.initialized:
                        // Game has just been initialized.
                        // Randomly decide who begins
                        this.#setTurn(Math.random()<0.5 ? -1 : 1);
                        this.#gameState = Core.GameStates.waitingForHuman;
                        break;
                    case Core.GameStates.waitingForHuman:
                        // Try requested move
                        this.#makeMove(this.#turn,move[0],move[1]);
                        break;
                    default:
                        throw new this.#InvalidGameStateError();
                }
                break;
            case Core.GameModes.vsAI:
                throw new this.#NotImplementedError();
            default:
                throw new this.#InvalidGameModeError();
        }
        // check for win conditions
        const win = this.#checkWinConditions();
        if(win.winner !== null){
            this.#gameState = Core.GameStates.finished;
            this.#turn = null;
        }else{
            // set next turn
            this.#setTurn(this.#turn * -1);
        }
        return callback({
            gameState: this.#gameState,
            boardState: this.#boardState,
            turn: this.#turn,
            winState: win
        });
    }
});