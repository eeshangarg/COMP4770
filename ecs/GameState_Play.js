// @flow
/* istanbul ignore file */
/* global module */
/* global require */
// flowlint untyped-import:off
// flowlint unclear-type:off

const GameEngine = require('./GameEngine.js');
const GameState = require('./GameState.js');
const EntityManager = require('./EntityManager.js');
const Entity = require('./Entity.js');
const Components = require('./Components.js');
const CTransform = Components.CTransform;
const CAnimation = Components.CAnimation;
const CBoundingBox = Components.CBoundingBox;
const CInput = Components.CInput;
const Vec = require('./Vec.js');
const { isOnScreen } = require('./Physics.js');

class GameState_Play extends GameState {
    game: GameEngine;
    entityManager: EntityManager;
    paused: boolean;
    player: Entity;
    levelPath: string;
    update: void => void;
    level: Object;

    constructor(game: GameEngine, level: Object) {
        super();
        this.level = level;
        this.game = game;
        this.entityManager = new EntityManager();
        this.paused = false;
        this.player = this.entityManager.addEntity("player");
        this.init();
    }

    init() {
        this.loadLevel();
    }

    loadLevel() {
        this.game.setBackground(this.level.background);
        let spawn = this.level.playerSpawn;
        this.spawnPlayer(new Vec(spawn[0],spawn[1]));
        let tiles = this.level.entites.tiles;
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            let newTile = this.entityManager.addEntity("tile");
            newTile.addComponent(new CTransform(new Vec(tile.pos[0],tile.pos[1])));
            newTile.addComponent(new CAnimation(tile.sprite, true));
            newTile.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }

        // TO-DO adjust for NPC implementation. Boiler-plate.
        let npcs = this.level.entites.npcs;
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            let newNpc = this.entityManager.addEntity("npc");
            newNpc.addComponent(new CTransform(new Vec(npc.pos[0],npc.pos[1])));
            newNpc.addComponent(new CAnimation(npc.sprite, true));
            newNpc.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }

        // TO-DO adjust for item implementation. Boiler-plate.
        let items = this.level.entites.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let newItem = this.entityManager.addEntity("item");
            newItem.addComponent(new CTransform(new Vec(item.pos[0],item.pos[1])));
            newItem.addComponent(new CAnimation(item.sprite, true));
            newItem.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }
    }

    parseLevel() {

        let tileParse = []
        let tiles = this.entityManager.getEntitiesByTag("tile");
        if (tiles != null) {
            for (let i = 0; i < tiles.length; i++) {
                let tile = tiles[i];
                let pos = tile.getComponent(CTransform).pos;
                let name = tile.getComponent(CAnimation).animation.spriteR;
                tileParse.push({pos:[pos.x,pos.y], sprite:name});
            }
        }

        // TO-DO adjust for NPC implementation. Boiler-plate.
        let npcParse = [];
        let npcs = this.entityManager.getEntitiesByTag("npc");
        if (npcs != null) {
            for (let i = 0; i < npcs.length; i++) {
                let npc = npcs[i];
                let pos = npc.getComponent(CTransform).pos;
                let name = npc.getComponent(CAnimation).animation.spriteR;
                npcParse.push({pos:[pos.x,pos.y], sprite:name});
            }
        }

        // TO-DO adjust for Item implementation. Boiler-plate.
        let itemParse = [];
        let items = this.entityManager.getEntitiesByTag("items");
        if (items != null) {
            for (let i = 0; i < items.length; i++) {
                let item = npcs[i];
                let pos = item.getComponent(CTransform).pos;
                let name = item.getComponent(CAnimation).animation.spriteR;
                itemParse.push({pos:[pos.x,pos.y], sprite:name});
            }
        }
    }

    spawnPlayer(pos: Vec) {
        this.player.addComponent(new CTransform(pos));
        this.player.addComponent(new CAnimation("playerRun", true));
        this.player.addComponent(new CInput());
    }

    update() {
        this.entityManager.update();
        this.parseLevel();
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

        playerInput.up = inputMap.w;
        playerInput.down = inputMap.s;
        playerInput.left = inputMap.a;
        playerInput.right = inputMap.d;
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
            let entity = entities[i];
            // Only draw entities with Animations.
            if (entity.hasComponent(CAnimation)){
                let pos = entity.getComponent(CTransform).pos;
                // Use culling to rapidly remove non-onscreen entites.
                if (isOnScreen(entity,playerPos,this.game.screenSize)) {
                    let dir = entity.getComponent(CTransform).facing;
                    let anim = entity.getComponent(CAnimation).animation;
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
