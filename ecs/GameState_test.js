// @flow
/* istanbul ignore file */
/* global module */
/* global require */
const GameEngine = require('./GameEngine.js');
const GameState = require('./GameState.js');
const EntityManager = require('./EntityManager.js');
const Components = require('./Components.js');
const CTransform = Components.CTransform;
const CAnimation = Components.CAnimation;
const Vec = require('./Vec.js');

// flowlint untyped-import:off

class GameState_test extends GameState {

    update: void => void;
    init: void => void;
    testSystem: void => void;
    entityManager: EntityManager;

    constructor(game: GameEngine) {

        super();

        const {
            emitFrame
        } = require('./../server/IOHandler.js');


        this.GameEngine = game;
        this.entityManager = new EntityManager();

        let inputMap = this.GameEngine.getInputMap();

        this.paused = false;

        this.init = function() {
            // ### TO BE REMOVED ### 
            let e = this.entityManager.addEntity("Foo");
            e.addComponent(new CTransform(new Vec(0, 0)));
            e.addComponent(new CAnimation("playerRun", true));
        };

        this.update = function() {
            this.entityManager.update();
            this.testSystem();
            emitFrame(this.GameEngine.socket, this.GameEngine.renderQueue, 0, 0);
            this.GameEngine.renderQueue = [];
        }

        this.testSystem = function() {
            let entities = this.entityManager.getAllEntities();
            for (let i = 0; i < entities.length; i++) {
                if (inputMap.w) {
                    entities[i].getComponent(CTransform).pos.y += 1;
                }

                let pos = entities[i].getComponent(CTransform).pos;
                entities[i].getComponent(CAnimation).animation.update();
                this.GameEngine.draw(entities[i].getComponent(CAnimation).animation, pos.x, pos.y, 1) ;
            }
        }
    }
}


module.exports = GameState_test;