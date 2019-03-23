// @flow
/* global module */
/* istanbul ignore file */
// flowlint unclear-type:off
// flowlint untyped-import:off

/* global require */
const GameState = require("./GameState.js");
const GameState_Menu = require("./GameState_Menu.js");
const GameState_Play = require("./GameState_Play.js");
const GameState_LevelEditor = require("./GameState_LevelEditor.js");
const Animation = require('./../rendering/Animation.js');
const Vec = require('./Vec.js');
let io = require('./../server/IOHandler.js');

class GameEngine {

    self: GameEngine;
    screenSize: Vec;
    socket: Object;                        // The GameEngine's main socket.
    states: Array<GameState>;              // The current game state-stack.
    statesToPush: Array<GameState>;        // The Gamestates to be pushed into the stack.
    popStates: number;                     // The number of states to-be popped off the stack.
    running: boolean;                      // The running bool.
    inputMap: Object;                      // The socket-driven inputMap.
    renderQueue: Array<Object>;            // The queue which holds all elements to-be rendered next frame.
    quit: void => void;                    // The helper function to quit the game engine.
    run: void => void;                     // The handler for stopping/running the update loop.
    runInterval: Object;                   // The main run interval of the GameEngine.
    init: void => void;                    // The initilzer function, to-be called on creation.
    update: void => void;                  // The maind update-loop function.
    pushState: string => void;             // Push a state via string onto the stack.
    popState: void => void;                // Call a state to be popped off the stack.
    inputMap: Object;                      // The map which holds all player inputs.
    getInputMap: void => Object;           // Get the games input-map.
    setInputMap: Object => void;           // Set the games input-map.
    drawFrame: Vec => void;                // The function which handles drawing a frame at a given pos.
    draw: (anim: Animation, dir: number, pos: Vec) => void;
    queueAnimation: (id: number, frame: number, dx: number, dy: number) => void;
    drawText: (textString: string, key: string, font: string, color: string, dx: number, dy: number) => void;

    setBackground: string => void;
    
    clearText: string => void;

    constructor(socket: Object) {
        this.self = this;
        this.socket = socket;
        this.states = [];
        this.renderQueue = [];
        this.statesToPush = [];
        this.popStates = 0;
        this.running = true;
        this.screenSize = new Vec(512,288);
        this.inputMap = {
            w: 0,
            a: 0,
            d: 0,
            s: 0,
            q: 0,
            e: 0,
            t: 0,
            u: 0,
            y: 9,
            del: 0,
            ctrl: 0,
            shift: 0,
            space: 0,
            enter: 0,
            escape: 0,
            click: 0,
            plus: 0,
            minus: 0,
            one: 0,
            two: 0,
            three: 0,
            four: 0,
            five: 0,
            mousePos: [0,0]
        };
        io = require('./../server/IOHandler.js');
    }

    // An intializer function for the game Enginge.
    init() {
        this.pushState('menu')
        this.run()
    }

    // The man "Run" loop of the game engine. Hold the run-interval.
    run() {
        let self = this.self;
        this.runInterval = setInterval(function(self: GameEngine) {
            if (self.running) {
                self.update();
            } else {
                clearInterval(this)
            }
        }, 16, self);
    }

    // The key-update loop of the engine. 
    update() {
        // Pop of N states queued to be popped.
        if (this.popStates > 0){
            for (let i = 0; i < this.popStates; i++) {
                if (this.states.length > 0) {
                    this.states.pop();
                    this.states[this.states.length - 1].init();
                }
            }
            this.popStates = 0;
        }
        // Push on the states that were requested to be pushed.
        if (this.statesToPush.length > 0){
            for (let i = 0; i < this.statesToPush.length; i++) {
                this.states.push(this.statesToPush[i]);
            }
            this.statesToPush = [];
        }
        // Update the top of the state stack. 
        this.states[this.states.length - 1].update();
    }

    // Push a state onto the "States to be pushed" stack.
    pushState(name: string) {
        if(name === 'menu'){
            let state: GameState_Menu = new GameState_Menu(this);
            this.statesToPush.push(state);
        }
        else if(name === 'single player'){
            let state: GameState_Play = new GameState_Play(this, 'SomeLevel');
            this.statesToPush.push(state);
        }
        else if(name === 'level editor'){
            let state: GameState_LevelEditor = new GameState_LevelEditor(this);
            this.statesToPush.push(state);
        }

        
    }

    // Queue up a state to be popped. (always top state.)
    popState() {
        this.popStates += 1;
    }

    // Gracefully quit out of the engine.
    quit() {
        this.running = false;
    }

    // Set the engines Input-map to be used by IO helper.
    setInputMap(map: Object) {
        this.inputMap = map;
    }

    // Get the engines Input-map to be used by IO helper.
    getInputMap(): Object {
        return this.inputMap;
    }

    // The function to "Queue" an Animation. Only used by Rendering.
    queueAnimation(id: number, frame: number, dx: number, dy: number) {
        // If queued with frame -1 push a static animation onto renderQueue.
        if (frame == -1) {
            this.renderQueue.push(
                [id, dx, 576-dy]
            );
        } else {
            this.renderQueue.push(
                [id, dx, 576-dy, frame]
            );
        }
    }

    draw(anim: Animation, dir: number, pos: Vec) {
        let id = 0;
        if (dir === -1) {
            id = anim.lid;
        } else {
            id = anim.rid;
        }

        if (anim.frameCount === 0) {
            this.queueAnimation(id, -1, pos.x, pos.y);
        } else {
            this.queueAnimation(id, anim.animationFrame, pos.x, pos.y);
        }
    }

    /*The function which handles drawing a frame in "Viewport" mode.
      This should be passed the center postions of the screen.
      I.e, PlayerPos, edtiorWindow Pos, ect.
    */
    drawFrame(pPos: Vec){
        io.emitFrame(this.socket, this.renderQueue, pPos.x, pPos.y);
        this.renderQueue = [];
    }

    // The function to handle setting the backgrounds based off spriteNames.
    setBackground(bgName: string){
        io.setBackground(this.socket, bgName);
    }

    /*
        This function handles drawing text, and parameterizing the given text draw.
            textString -> The text you want to render.
            key -> The key the text elements is refered to by.
            font -> The font & font size of the text to be drawn.
            color -> The HTLM5 hex color of text to be drawn.
            dx -> The x position.
            dy -> The Y posistion. 
    */
    drawText(textString: string, key: string, font: string, color: string, dx: number, dy: number) {
        io.drawText(this.socket, textString, key, font, color, dx, dy);
    }

    // The function to handle clearing text strings.
    clearText(key: string){
        io.clearText(this.socket, key);
    }
}

module.exports = GameEngine;
