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
    #aiStrategy;
    #aiSymbol;
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
        /** Easiest - will try to make other player win 
         * Description: He's actually very smart, just hates winning
        */
        dumbo: Symbol("He's actually very smart, he just hates winning!"),
        /** Random - will always choose random 
         * Description: Doesn't actually know the game's rules. Just clicks on empty boxes
        */
        rando: Symbol("Doesn't actually understands this game, just clicks on empty boxes..."),
        /** Mostly random but won't miss obviously winning moves
         * Description: Not the brightest bulb, but he's trying at least
        */
        smarto: Symbol("Not the brightest bulb, but he's trying at least..."),
        /** Hardest - will always tie or win 
         * Description: She's the master of this game. You can't actually beat her, best hope for a draw
        */
        maestro: Symbol("She's the master of this game. You can't actually beat her, best you can hope for is a draw!")
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

    #winConditionsBitboards = [7, 56, 448, 73, 146, 292, 273, 84];
    #tieConditionBitboard = 511;

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

    #aiMove() {
        if (this.#gameMode !== Core.GameModes.vsAI)
            throw new this.#InvalidGameModeError();
        if (this.#players[this.#turn] !== Core.PlayerControllers.ai)
            throw new this.#InvalidPlayerControllerError();
        return new Promise(resolve => {
            setTimeout(()=>{
                switch (this.#aiStrategy) {
                    case Core.AIStrategies.rando:
                        let [xBoard, oBoard] = this.arrayToBitboards(this.#boardState);
                        let emptyBoard = ~(xBoard|oBoard);
                        let rand;
                        do {
                            rand = Math.floor(Math.random() * 9);
                            console.log(rand, (xBoard | oBoard).toString(2), (1 << rand).toString(2));
                        } while ((emptyBoard & (1 << rand))===0)
                        this.#makeMove(this.#turn, Math.floor(rand / 3), rand % 3);
                        break;
                    default:
                        throw this.#NotImplementedError();
                    
                }
                resolve();
            },200)
        })
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

    #InvalidGameStateError = class InvalidGameStateError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid Game State Error";
        }
    }

    #InvalidAIStrategyError = class InvalidAIStrategy extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid AI Strategy Error";
        }
    }

    #NotImplementedError = class NotImplementedError extends Error {
        constructor(msg) {
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

    #InvalidGameModeError = class InvalidGameModeError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid Game Mode";
        }
    }

    #InvalidBitboardStateError = class InvalidBitboardStateError extends Error {
        constructor(msg) {
            super(msg);
            this.name = "Invalid Bitboard State Error";
        }
    }

    /* Public Methods */
    constructor() {
        this.#initBoard();
    }

    /**
     * (Re-)initializes the game for the provided mode
     * @param {Symbol} mode - game mode to initialize: must be a valid Symbol from Core.GameModes
     * @param {Number} aiSymbol - +1 for X, -1 for O. Ignored for vsHuman GameMode
     * @param {*} aiStrategy - which ai difficulty to initialize with. Must be a valid Symbol from Core.AIStrategies. Ignored for vsHuman GameMode
     */
    initializeGame(mode, aiStrategy = Core.AIStrategies.rando, aiSymbol = -1) {
        switch (mode) {
            case Core.GameModes.vsHuman:
                this.#gameMode = mode;
                this.#initPlayers(Core.PlayerControllers.human, Core.PlayerControllers.human);
                break;
            case Core.GameModes.vsAI:
                if (!Object.values(Core.Players).includes(aiSymbol))
                    throw new this.#InvalidPlayerError();
                if (!Object.values(Core.AIStrategies).includes(aiStrategy))
                    throw new this.#InvalidAIStrategyError();
                this.#gameMode = mode;
                this.#aiStrategy = aiStrategy;
                this.#initPlayers(
                    aiSymbol > 0 ? Core.PlayerControllers.ai : Core.PlayerControllers.human,
                    aiSymbol > 0 ? Core.PlayerControllers.human : Core.PlayerControllers.ai
                );
                break;
            // throw new this.#NotImplementedError("This feature is not yet implemented");
            default:
                throw new this.#InvalidGameModeError(`Game mode must be one of Core.GameModes.{${Object.keys(Core.GameModes)}}`);
        }
        this.#initBoard();
        this.#initState();
    }

    publicTestFunction2() {
        const result = [];
        // winConditions to bitBoards:
        this.#winConditions.forEach((condition) => {
            const arr = Array(3).fill(null).map(() => Array(3).fill(null));
            condition.forEach((coord) => arr[coord[0]][coord[1]] = 1);
            result.push(this.arrayToBitboards(arr)[0]);
        })
        return result;
    }
    /**
     * 
     * @param {Function} callback the callback function that handles the next state of the game
     * Its parameter should an object with members: gameState, boardState, turn, winState{winner, winningCondition}
     * @param  {...any} move row, col for next move. Can be null if it's AI's turn.
     */
    nextTurn(callback, ...move) {
        return new Promise((resolve, reject) => {
            switch (this.#gameMode) {
                case Core.GameModes.vsHuman:
                    switch (this.#gameState) {
                        case Core.GameStates.initialized:
                            // Game has just been initialized.
                            // Randomly decide who begins
                            this.#setTurn(Math.random() < 0.5 ? -1 : 1);
                            this.#gameState = Core.GameStates.waitingForHuman;
                            break;
                        case Core.GameStates.waitingForHuman:
                            // Try requested move
                            this.#makeMove(this.#turn, move[0], move[1]);
                            // set next turn
                            this.#setTurn(this.#turn * -1);
                            break;
                        default:
                            throw new this.#InvalidGameStateError();
                    }
                    break;
                case Core.GameModes.vsAI:
                    switch (this.#gameState) {
                        case Core.GameStates.initialized:
                            // Game has just been initialized
                            // Randomly decide who begins
                            this.#setTurn(Math.random() < 0.5 ? -1 : 1);
                            // Check if AI starts or Human does, set state accordingly
                            this.#gameState = this.#players[this.#turn] === Core.PlayerControllers.ai ? Core.GameStates.waitingForAI : Core.GameStates.waitingForHuman;
                            resolve(this.#reportGameState(callback));
                            break;
                        case Core.GameStates.waitingForHuman:
                            this.#makeMove(this.#turn, move[0], move[1]);
                            // set next turn
                            this.#setTurn(this.#turn * -1);
                            this.#gameState = Core.GameStates.waitingForAI;
                            resolve(this.#reportGameState(callback));
                            break;
                        case Core.GameStates.waitingForAI:
                            this.#aiMove().then(() => {
                                // set next turn
                                this.#setTurn(this.#turn * -1);
                                this.#gameState = Core.GameStates.waitingForHuman
                                resolve(this.#reportGameState(callback));
                            });
                            break;
                        default:
                            throw new this.#InvalidGameStateError();
                    }
                    break;
                // throw new this.#NotImplementedError();
                default:
                    throw new this.#InvalidGameModeError();
            }
        });
    }

    #reportGameState(callback){
        const win = this.#checkWinConditions();
            if (win.winner !== null) {
                this.#gameState = Core.GameStates.finished;
                this.#turn = null;
            }

            return callback({
                gameState: this.#gameState,
                boardState: this.#boardState,
                turn: this.#turn,
                winState: win
            });
    }
    /**
    * Converts the 2d array representation to bitboards for x and o respectively
    * @param {Array} array - A 2D array representing the board state. 1 for 'O', 1 for 'X' and null for empty
    * @returns {Array} - The bitboard representation for [x,o]
    */
    arrayToBitboards(array) {
        let bitboardX = 0, bitboardO = 0;
        for (let i = 0; i < 9; i++) {
            const [rowId, colId] = [Math.floor(i / 3), i % 3];
            if (array[rowId][colId] === 1)
                bitboardX |= (1 << i);
            else if (array[rowId][colId] === -1)
                bitboardO |= (1 << i);
        }
        return [bitboardX, bitboardO];
    }
    /**
 * 
 * @param {Number} bitboardX - bitboard representation of x-occupied squares
 * @param {Number} bitboardO - bitboard representation of o-occupied squares
 * @returns {Array} - 2D array representing board state, null -> empty, 1 -> X, -1 -> O
 */
    bitboardsToArray(bitboardX, bitboardO) {
        const array = Array(3).fill(null).map(() => Array(3).fill(null));
        for (let i = 0; i < 9; i++) {
            const [rowId, colId] = [Math.floor(i / 3), i % 3];
            if ((1 << i) & bitboardX)
                array[rowId][colId] = 1;
            else if ((1 << i) & bitboardO)
                array[rowId][colId] = -1;
        }
        return array;
    }

    minimax(bitboardX, bitboardO, xTurn) {
        // first, we'll check for winconditions and terminal states(no-win bitboardX|bitboardO is 9 full bits) return score if finished
        for (let cond of this.#winConditionsBitboards) {
            if ((bitboardO & cond) === cond)
                return xTurn ? -1 : 1;
            if ((bitboardX & cond) === cond)
                return xTurn ? 1 : -1;
        }
        if ((bitboardO | bitboardX) === this.#tieConditionBitboard)
            return 0;
    }

}); 