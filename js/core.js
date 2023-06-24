export default Object.freeze(class Core{
    #gameMode;
    #gameState;
    
    constructor(mode=Core.GameModes.vsHuman){
        this.gameMode = mode;
    }
    static GameModes = Object.freeze({
        vsAI: Symbol('Single Player'),
        vsHuman: Symbol('Two Players'),
    });

    static GameStates = Object.freeze({
        initialized: Symbol('Game Initialized'),
        waitingForHuman: Symbol('Waiting User Move'),
        waitingForAI: Symbol('Waiting for AI Move'),
        finished: Symbol('Finished')
    });

    get gameMode(){return this.#gameMode;}

    set gameMode(val){
        if(val in Object.keys(Core.GameModes)){
            this.#gameMode = val;
            return;
        }
        console.error('Invalid Game mode!');
    }

})