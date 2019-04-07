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
    spLevels: Array<Object>                // The single-player levels array.
    db: Object;                            // The data-base object.
    screenSize: Vec;                       // The screen size.
    diff: number;                          // The difficulty value of the game.
    socket: Object;                        // The GameEngine's main socket.
    states: Array<GameState>;              // The current game state-stack.
    statesToPush: Array<GameState>;        // The Gamestates to be pushed into the stack.
    popStates: number;                     // The number of states to-be popped off the stack.
    running: boolean;                      // The running bool.
    soundOn : boolean;                     // The boolean to toggle game-sound.
    inputMap: Object;                      // The socket-driven inputMap.
    renderQueue: Array<Object>;            // The queue which holds all elements to-be rendered next frame.
    quit: void => void;                    // The helper function to quit the game engine.
    run: void => void;                     // The handler for stopping/running the update loop.
    runInterval: Object;                   // The main run interval of the GameEngine.
    init: void => void;                    // The initilzer function, to-be called on creation.
    update: void => void;                  // The maind update-loop function.
    popState: void => void;                // Call a state to be popped off the stack.
    inputMap: Object;                      // The map which holds all player inputs.
    getInputMap: void => Object;           // Get the games input-map.
    setInputMap: Object => void;           // Set the games input-map.
    drawFrame: Vec => void;                // The function which handles drawing a frame at a given pos.
    getCustomLevels: void => Array<Object>;// This function returns all of the current-user's custom levels.
    saveLevel: Object => void;             // This function saves the given level to the DB.
    cheats: Object                         // The JSON object which holds the status of cheats.
    pushState: (state: string, key: number) => void;
    draw: (anim: Animation, dir: number, pos: Vec) => void;
    queueAnimation: (id: number, frame: number, dx: number, dy: number) => void;
    drawText: (textString: string, key: string, font: string, color: string, dx: number, dy: number) => void;
    setBackground: string => void;    
    clearText: string => void;

    constructor(socket: Object, database: Object, levels: Object) {
        this.self = this;
        this.socket = socket;
        this.db = database;
        this.spLevels = levels;
        this.states = [];
        this.renderQueue = [];
        this.statesToPush = [];
        this.popStates = 0;
        this.running = true;
        this.screenSize = new Vec(512,288);
        this.diff = 1;
        this.inputMap = {
            w: 0,
            a: 0,
            d: 0,
            s: 0,
            q: 0,
            e: 0,
            t: 0,
            u: 0,
            y: 0,
            n: 0,
            i: 0,
            b: 0,
            r: 0,
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

        this.cheats = {
            playAsNPCs: false,
            superSpeed: false,
            lowGravity: false,
            godMode: false,
            pvp: false
        }

        this.soundOn = true;

        io = require('./../server/IOHandler.js');
    }

    // An intializer function for the game Enginge.
    init() {
        this.pushState('menu', 0)
        this.run()
    }

    // The man "Run" loop of the game engine. Hold the run-interval.
    run() {
        // Offset for last frame running time. (Frame-pacing.)
        if (this.running) {
            let start = process.hrtime()
            this.update();
            let end = process.hrtime(start)
            setTimeout(this.run.bind(this), 16.666 - end[1] / 1000000);
        }
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
    pushState(name: string, key: number) {
        if(name === 'menu'){
            let state: GameState_Menu = new GameState_Menu(this);
            this.statesToPush.push(state);
        }
        else if(name === 'single player'){
            let state: GameState_Play = new GameState_Play(this, this.spLevels[key]);
            this.statesToPush.push(state);
        }
        else if(name === 'custom level'){
            let self = this;
            // $FlowFixMe
            this.getCustomLevels(function(customLevels) {
                let state: GameState_Play = new GameState_Play(self, customLevels[key]);
                self.statesToPush.push(state);
            });
        }
        else if(name === 'level editor'){
            let self = this;
            // $FlowFixMe
            this.getCustomLevels(function(customLevels) {
                let state: GameState_LevelEditor = new GameState_LevelEditor(self, customLevels[key]);
                self.statesToPush.push(state);
            });
        }
    }


    // The function to handle setting the users leve-progress.
    setNextLevel(levelName: string) {
            let notCheating = Object.values(this.cheats).every(function(cheat) {
                return !cheat;
            })

            if (notCheating) {

                let self = this;
                let index = -1;
                if (levelName === "level 1") {
                    index = 1;
                } else if (levelName === "level 2") {
                    index = 2;
                } else if (levelName === "level 3") {
                    index = 3;
                } else if (levelName === "level 4") {
                    index = 4;
                }


                // $FlowFixMe
                let callback = function(levelCompleted) {

                    if (index > levelCompleted) {
                        self.db.collection(self.socket.userName + 'Progress').updateOne({}, {
                            $set: {
                                "levelCompleted": index
                            }
                        }, {
                            upsert: true
                        });
                    }
                }
                this.db.collection(this.socket.userName + 'Progress').findOne({}, function(err, progress) {
                    callback(progress.levelCompleted);
                });
            }
    }

    // The function to handle getting the users progress.
    // $FlowFixMe
    getProgress(callback): Object {
        this.db.collection(this.socket.userName + 'Progress').findOne({}, function(err, progress) {
            callback(progress);
        });
    }

    // The function to hanlding getting a user's custom levels.
    // $FlowFixMe
    getCustomLevels(callback) {
        // $FlowFixMe
        this.db.collection(this.socket.userName + 'Levels').find({}).toArray(function(err, levels) {
            callback(levels);
        });
    }

    // The function to handle saving a level.
    saveLevel(level: Object) {
        let levelQuery = {username:this.socket.userName, name:level.name};
        this.db.collection(this.socket.userName + 'Levels').updateOne(levelQuery, { $set:level }, { upsert: true } );
        let message = {
            t: 'k',
            m: level.name + " saved!"
        }
        let json = JSON.stringify(message);
        let buf = new Buffer.from(json, 'utf8');
        this.socket.send(buf);

        // TO-DO remove me:
        const fs = require('fs')
        let date = new Date();
        let fileName = './' + level.name + '_'+ this.socket.userName + '_' + date.getTime() + '.json' 
        let stringyboi = JSON.stringify(level,null, 4);
        fs.writeFileSync(fileName, stringyboi, 'utf-8');

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

    muteMusic() {
        let message = {
            t: 'm'
        }
        let json = JSON.stringify(message);
        let buf = new Buffer.from(json, 'utf8');
        this.socket.send(buf);
    }


    setScore(currentScore: number, levelName: string) {
        let notCheating = Object.values(this.cheats).every(function(cheat) {
            return !cheat;
        })

        if (notCheating) {
            let index = -1;
            if (levelName === "level 1") {
                index = 0;
            } else if (levelName === "level 2") {
                index = 1;
            } else if (levelName === "level 3") {
                index = 2;
            } else if (levelName === "level 4") {
                index = 3;
            } else if (levelName === "level 5") {
                index = 4;
            }
            if (index !== -1) {
                let self = this;
                // $FlowFixMe
                let callback = function(newScore) {

                    if (newScore[index] <= currentScore) {
                        let newScoreArray = newScore;
                        newScoreArray[index] = currentScore;
                        self.db.collection(self.socket.userName + 'Progress').updateOne({}, {
                            $set: {
                                "score": newScoreArray
                            }
                        }, {
                            upsert: true
                        });
                    }
                }
                this.db.collection(this.socket.userName + 'Progress').findOne({}, function(err, progress) {
                    callback(progress.score);
                });
            }
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

    // The function to hanlde playing sounds.
    playSound(soundName: string) {
        if (this.soundOn) {
            io.playSound(this.socket, soundName);
        }
    }

    // The fucntion to handle stopping sounds.
    stopSound(soundName: string) {
        io.stopSound(this.socket, soundName);
    }
}

module.exports = GameEngine;
