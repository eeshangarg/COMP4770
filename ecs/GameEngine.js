// @flow
/* global module */
/* istanbul ignore file */
// flowlint unclear-type:off
// flowlint untyped-import:off

/* global require */
const GameState = require("./GameState.js");
const GameState_Menu = require("./GameState_Menu.js");
const Animation = require('./../rendering/Animation.js');
const Vec = require('./Vec.js');
let io = require('./../server/IOHandler.js');

class GameEngine {

    socket: Object;
    states: Array<GameState>;
    statesToPush: Array<GameState>;
    popStates: number;
    running: boolean;
    inputMaup: Object;
    quit: void => void;
    run: void => void;
    init: void => void;
    update: void => void;
    pushState: GameState => void;
    popState: void => void;
    getInputMap: void => Object;
    setInputMap: Object => void;
    draw: (anim: Animation, dir: number, pos: Vec) => void;
    drawFrame: Vec => void;
    queueAnimation: (id: number, frame: number, dx: number, dy: number) => void;
    renderQueue: Array<Object>;
    self: GameEngine;
    runInterval: Object;
    inputMap: Object;
    setBackground: string => void;
    drawText: (textString: string, key: string, font: string, color: string, dx: number, dy: number) => void;
    clearText: string => void;

    constructor(socket: Object) {
            this.self = this;
            this.socket = socket;
            this.states = [];
            this.renderQueue = [];
            this.statesToPush = [];
            this.popStates = 0;
            this.running = true;
            this.inputMap = {
                w: false,
                a: false,
                d: false,
                s: false,
                space: false,
                enter: false,
                mousePos:[0,0]
            };
            io = require('./../server/IOHandler.js');
        }

    // An intializer function for the game Enginge.
    init() {
        let state: GameState_Menu = new GameState_Menu(this);
        this.pushState(state)
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
        }, 16.666, self);
    }


    update() {
        // Pop of N states queued to be popped.
        for (let i = 0; i < this.popStates; i++) {
            if (this.states.length > 0) {
                this.states.pop();
            }
        }
        // Reset the pop-state counter.
        this.popStates = 0;

        // Push on the states that were requested to be pushed.
        for (let i = 0; i < this.statesToPush.length; i++) {
            this.states.push(this.statesToPush[i]);
        }

        // Update the top of the state stack. 
        this.states[this.states.length - 1].update();


    }

    // Push a state onto the "States to be pushed" stack.
    pushState(state: GameState) {
        this.statesToPush.push(state);
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
            this.renderQueue.push({
                n: id,
                d: [dx, dy]
            });
        } else {
            this.renderQueue.push({
                n: id,
                d: [dx, dy],
                f: frame
            });
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

    drawFrame(pPos: Vec){
        io.emitFrame(this.socket, this.renderQueue, pPos.x, pPos.y);
        this.renderQueue = [];
    }

    setBackground(bgName: string){
        io.setBackground(this.socket, bgName);
    }

    drawText(textString: string, key: string, font: string, color: string, dx: number, dy: number) {
        io.drawText(this.socket, textString, key, font, color, dx, dy);
    }

    clearText(key: string){
        io.clearText(this.socket, key);
    }
}

module.exports = GameEngine;