// @flow
/* istanbul ignore file */
/* global module */
/* global require */
// flowlint untyped-import:off

const GameEngine = require('./GameEngine.js');
const GameState = require('./GameState.js');
const EntityManager = require('./EntityManager.js');
const Entity = require('./Entity.js');
const Components = require('./Components.js');
const CTransform = Components.CTransform;
const CAnimation = Components.CAnimation;
const CInput = Components.CInput;
const Vec = require('./Vec.js');

class GameState_Play extends GameState {
    game: GameEngine;
    entityManager: EntityManager;
    paused: boolean;
    player: Entity;
    levelPath: string;
    update: void => void;

    constructor(game: GameEngine, levelPath: string) {
        super();
        this.game = game;
        this.entityManager = new EntityManager();
        this.paused = false;
        this.player = this.entityManager.addEntity("player");
        this.levelPath = levelPath;
        this.init();
    }

    init() {
        this.game.setBackground('bg_cave');
        this.loadLevel();
        this.spawnPlayer();
        // remove :
        let tile = this.entityManager.addEntity("tile");
        tile.addComponent(new CTransform(new Vec(10, -10)));
        tile.addComponent(new CAnimation("cave-platform", true));
    }

    loadLevel() {
        // TODO: load the level here (if necessary)
    }

    spawnPlayer() {
        this.player.addComponent(new CTransform(new Vec(0, 0)));
        this.player.addComponent(new CAnimation("playerRun", true));
        this.player.addComponent(new CInput());
    }

    update() {
        this.entityManager.update();

        if (!this.paused) {
            this.sAI();
            this.sMovement();
            this.sLifespan();
            this.sCollision();
            this.sAnimation();
        }

        this.sUserInput();
        this.sRender();

    }

    sUserInput() {
        // TODO: Process all user input here
        let inputMap = this.game.getInputMap();
        let playerInput = this.player.getComponent(CInput);
        if (inputMap.escape){
            this.game.popState();
        }

        let playerPos = this.player.getComponent(CTransform).pos;
        let px = playerPos.x - 512;
        let py = playerPos.y - 288;

        playerInput.up = inputMap.w;
        playerInput.down = inputMap.s;
        playerInput.left = inputMap.a;
        playerInput.right = inputMap.d;
        playerInput.mousePos = new Vec (inputMap.mousePos[0] + px, inputMap.mousePos[1] + py);
    }

    sMovement() {
        let playerInput = this.player.getComponent(CInput);

        // Example
        if (playerInput.up) {
            this.player.getComponent(CTransform).pos.y += 3;
        }
        else if (playerInput.down) {
            this.player.getComponent(CTransform).pos.y -= 3;
        }

        if (playerInput.left) {
            this.player.getComponent(CTransform).pos.x -= 3;
            this.player.getComponent(CTransform).facing = -1;
        } else if (playerInput.right) {
            this.player.getComponent(CTransform).pos.x += 3;
            this.player.getComponent(CTransform).facing = 1;
        }
    }

    sAnimation() {
        // TODO: Handle all animation here.
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            if (entities[i].hasComponent(CAnimation)){
                entities[i].getComponent(CAnimation).animation.update();
            }
        }
    }

    sRender() {
        let playerPos = this.player.getComponent(CTransform).pos;
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            // Only draw entities with Animations.
            if (entities[i].hasComponent(CAnimation)){
                let pos = entities[i].getComponent(CTransform).pos;
                // Use culling to rapidly remove non-onscreen entites.
                if (playerPos.distf(pos) < 360000) {
                    let dir = entities[i].getComponent(CTransform).facing;
                    let anim = entities[i].getComponent(CAnimation).animation;
                    this.game.draw(anim, dir, pos);
                }
            }
        }
        this.game.drawFrame(playerPos);
    }

    sAI() {
        // TODO: Implement Follow and Patrol behavior
    }

    sCollision() {
        // TODO: Implement collisions and physics
    }

    sLifespan() {
        // TODO: Support entity lifespans
    }
}

module.exports = GameState_Play;
