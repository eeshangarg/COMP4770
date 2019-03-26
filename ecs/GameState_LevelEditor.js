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
const CDraggable = Components.CDraggable;
const CInput = Components.CInput;
const Vec = require('./Vec.js');
const getAnimationsByTag = require('./../rendering/Rendering.js').getAnimationsByTag;

class GameState_LevelEditor extends GameState {
    game: GameEngine;
    entityManager: EntityManager;
    player: Entity;
    update: void => void;
    gridMode: boolean;
    level: Object;
    background: string;
    playerSpawn: Vec;
    levelObjective: Vec;
    music: String; //eslint-disable-line


    constructor(game: GameEngine, level: Object) {
        super();
        this.level = level;
        this.background = level.background;
        this.music = level.music;
        this.playerSpawn = new Vec(level.playerSpawn[0], level.playerSpawn[1]);
        this.levelObjective = new Vec(level.levelObjective[0], level.levelObjective[1]);
        this.game = game;
        this.level = level;
        this.entityManager = new EntityManager();
        this.player = this.entityManager.addEntity("player");
        this.gridMode = false;
        this.init();
    }

    init() {
        this.loadLevel();
    }


    // $FlowFixMe
    loadLevel() {

        this.game.setBackground(this.background);
        this.spawnPlayer(this.playerSpawn);

        let tiles = this.level.entities.tiles;
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            let newTile = this.entityManager.addEntity("tile");
            newTile.addComponent(new CTransform(new Vec(tile.pos[0],tile.pos[1])));
            newTile.addComponent(new CAnimation(tile.sprite, true));
            newTile.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
            newTile.addComponent(new CDraggable());
        }

        let npcs = this.level.entities.npcs;
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            let newNpc = this.entityManager.addEntity("npc");
            newNpc.addComponent(new CTransform(new Vec(npc.pos[0],npc.pos[1])));
            newNpc.addComponent(new CDraggable());
            if (npc.name === "cowman") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[0], true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
            } else if (npc.name === "imp") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[2], true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
            } else if (npc.name === "goblin") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[1], true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
            }
        }

        let items = this.level.entities.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let newItem = this.entityManager.addEntity("item");
            newItem.addComponent(new CTransform(new Vec(item.pos[0],item.pos[1])));
            newItem.addComponent(new CAnimation(item.sprite, true));
            newItem.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
            newItem.addComponent(new CDraggable());
        }

        let decorations = this.level.entities.decs;
        for (let i = 0; i < decorations.length; i++) {
            let decoration = decorations[i];
            let newDec = this.entityManager.addEntity('dec');
            newDec.addComponent(new CTransform(new Vec(decoration.pos[0], decoration.pos[1])));
            newDec.addComponent(new CAnimation(decoration.sprite, true));
            let anim = newDec.getComponent(CAnimation).animation
            newDec.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
            newDec.addComponent(new CDraggable());
        }
    }

    parseLevel() {

        let tileParse = []
        let playerPos = this.player.getComponent(CTransform).pos;

        let tiles = this.entityManager.getEntitiesByTag("tile");
        if (tiles != null) {
            for (let i = 0; i < tiles.length; i++) {
                let tile = tiles[i];
                let pos = tile.getComponent(CTransform).pos;
                let name = tile.getComponent(CAnimation).animation.name;
                tileParse.push({pos:[pos.x,pos.y], sprite:name});
            }
        }

        let npcParse = [];
        let npcs = this.entityManager.getEntitiesByTag("npc");
        if (npcs != null) {
            for (let i = 0; i < npcs.length; i++) {
                let npc = npcs[i];
                let pos = npc.getComponent(CTransform).pos;
                let name = npc.getComponent(CAnimation).animation.name;
                if (name === "cowmanIdle"){
                     npcParse.push({pos:[pos.x,pos.y], name:"cowman"});
                }
                else if (name === "impIdle") {
                    npcParse.push({pos:[pos.x,pos.y], name:"imp"});
                }
                else if (name === "goblinIdle"){
                    npcParse.push({pos:[pos.x,pos.y], name:"goblin"});
                }
               
            }
        }

        let itemParse = [];
        let items = this.entityManager.getEntitiesByTag("item");
        if (items != null) {
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let pos = item.getComponent(CTransform).pos;
                let name = item.getComponent(CAnimation).animation.name;
                itemParse.push({pos:[pos.x,pos.y], sprite:name});
            }
        }

        let decParse = [];
        let decs = this.entityManager.getEntitiesByTag('dec');
        if (decs != null) {
            for (let i = 0; i < decs.length; i++) {
                let dec = decs[i];
                let pos = dec.getComponent(CTransform).pos;
                let name = dec.getComponent(CAnimation).animation.name;
                decParse.push({pos:[pos.x,pos.y], sprite:name});
            }
        }

        let levelParse = {
            username: this.level.username,
            name: this.level.name,
            background:  this.background,
            music: this.music,
            playerSpawn: [playerPos.x, playerPos.y],
            levelObjective: [this.levelObjective.x, this.levelObjective.y],
            entities: {
                tiles: tileParse,
                npcs: npcParse,
                items: itemParse,
                decs: decParse
            }
        }

        this.game.saveLevel(levelParse);
    }

    spawnPlayer(pos: Vec) {
        this.player.addComponent(new CTransform(pos));
        this.player.addComponent(new CInput());
        // $FlowFixMe
        this.player.addComponent(new CAnimation(getAnimationsByTag('player')[0], true));
        let animation = this.player.getComponent(CAnimation).animation;
        let bounds = new Vec(animation.width, animation.height);
        this.player.addComponent(new CBoundingBox(bounds, true, true));
    }

    update() {
        this.entityManager.update();
        this.sMovement();
        this.sAnimation();
        this.sUserInput();
        this.sDrag();
        this.sRender();
    }

    sUserInput() {
        let inputMap = this.game.getInputMap();
        let playerInput = this.player.getComponent(CInput);

        if (inputMap.escape){
            inputMap.escape = 0;
            this.game.popState();
        }

        if (inputMap.ctrl && inputMap.enter) {
            inputMap.enter = 0;
            inputMap.ctrl = 0;
            this.parseLevel();
            this.game.popState();
        }

        playerInput.up = inputMap.w;
        playerInput.left = inputMap.a;
        playerInput.down = inputMap.s;
        playerInput.right = inputMap.d;

        if (inputMap.t && this.canInsert()) {
            this.insertTile();
            inputMap.t = 0;
        }

        if (inputMap.n && this.canInsert()) {
            this.insertNPC();
            inputMap.n = 0;
        }

        if (inputMap.y && this.canInsert()) {
            this.insertDecoration();
            inputMap.y = 0;
        }

        if (inputMap.i && this.canInsert()) {
            this.insertItem();
            inputMap.i = 0;
        }

        if (inputMap.click) {
            this.dragOrDropEntity();
            inputMap.click = 0;
        }

        if (inputMap.minus) {
            this.displayNextAnimationForSelectedEntity('left');
            inputMap.minus = 0;
        }

        if (inputMap.plus) {
            this.displayNextAnimationForSelectedEntity('right');
            inputMap.plus = 0;
        }

        if (inputMap.g) {
            this.gridMode = !this.gridMode;
            inputMap.g = 0;
        }

        if (inputMap.del) {
            this.deleteSelectedEntity();
            inputMap.del = 0;
        }

        if (inputMap.b) {
            this.changeBackground();
            inputMap.b = 0;
        }
    }

    sMovement() {
        let playerInput = this.player.getComponent(CInput);

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
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            if (entities[i].hasComponent(CAnimation)){
                entities[i].getComponent(CAnimation).animation.update();
            }
        }
    }

    sRender() {
        let playerPos = this.player.getComponent(CTransform).pos;
        this.renderEntitiesByTag('dec');
        this.renderEntitiesByTag('tile');
        this.renderEntitiesByTag('item');
        this.renderEntitiesByTag('npc');
        this.renderEntitiesByTag('player');
        this.game.drawFrame(playerPos);
    }

    renderEntitiesByTag(tag: string) {
        let playerPos = this.player.getComponent(CTransform).pos;
        let entities = this.entityManager.getEntitiesByTag(tag);

        if (entities === undefined) {
            return;
        }

        let len = entities.length;
        for (let i = 0; i < len; i++) {
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
    }

    sDrag() {
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (!entity.hasComponent(CDraggable)) {
                continue;
            }

            if (entity.getComponent(CDraggable).isBeingDragged) {
                if (this.gridMode) {
                    let halfSize = entity.getComponent(CBoundingBox).halfSize;
                    let mousePos = this.getMousePosition();
                    let snappedPos = new Vec(16 * Math.floor(mousePos.x / 16) + halfSize.x,
                                             16 * Math.floor(mousePos.y / 16) + halfSize.y);
                    entity.getComponent(CTransform).pos = snappedPos;
                }
                else {
                    entity.getComponent(CTransform).pos = this.getMousePosition();
                }
            }
        }
    }

    insertNPC() {
        let npc = this.entityManager.addEntity("npc");
        npc.addComponent(new CTransform(this.getMousePosition()));
        npc.addComponent(new CDraggable());
        npc.getComponent(CDraggable).isBeingDragged = true;
        // $FlowFixMe
        npc.addComponent(new CAnimation(getAnimationsByTag('npc')[0], true));
        let animation = npc.getComponent(CAnimation).animation;
        let bounds = new Vec(animation.width, animation.height);
        npc.addComponent(new CBoundingBox(bounds, true, true));
    }

    insertTile() {
        let tile = this.entityManager.addEntity("tile");
        tile.addComponent(new CTransform(this.getMousePosition()));
        tile.addComponent(new CDraggable());
        tile.getComponent(CDraggable).isBeingDragged = true;
        // $FlowFixMe
        tile.addComponent(new CAnimation(getAnimationsByTag('tile')[0], true));
        tile.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
    }

    insertDecoration() {
        let dec = this.entityManager.addEntity("dec");
        dec.addComponent(new CTransform(this.getMousePosition()));
        dec.addComponent(new CDraggable());
        dec.getComponent(CDraggable).isBeingDragged = true;
        // $FlowFixMe
        dec.addComponent(new CAnimation(getAnimationsByTag('dec')[0], true));
        let animation = dec.getComponent(CAnimation).animation;
        let bounds = new Vec(animation.width, animation.height);
        dec.addComponent(new CBoundingBox(bounds, false, false));
    }

    insertItem() {
        let item = this.entityManager.addEntity("item");
        item.addComponent(new CTransform(this.getMousePosition()));
        item.addComponent(new CDraggable());
        item.getComponent(CDraggable).isBeingDragged = true;
        // $FlowFixMe
        item.addComponent(new CAnimation(getAnimationsByTag('item')[0], true));
        let animation = item.getComponent(CAnimation).animation;
        let bounds = new Vec(animation.width, animation.height);
        item.addComponent(new CBoundingBox(bounds, false, false));
    }

    dragOrDropEntity() {
        // We loop backwards here so that the entities on top are picked up first
        let entities = this.entityManager.getAllEntities();
        for (let i = entities.length-1; i >= 0; i--) {
            let entity = entities[i];
            if (!entity.hasComponent(CDraggable)) {
                continue;
            }

            let draggable = entity.getComponent(CDraggable);

            if (this.entityAtMousePos(entity)) {
                if (draggable.isBeingDragged && this.canDropEntity(entity)) {
                    draggable.isBeingDragged = false;
                }
                else if (!draggable.isBeingDragged) {
                    draggable.isBeingDragged = true;
                }

                break;
            }
        }
    }

    entityAtMousePos(entity: Entity): boolean {
        let mousePos = this.getMousePosition();
        let position = entity.getComponent(CTransform).pos;
        let halfSize = entity.getComponent(CBoundingBox).halfSize;
        let x_high = position.x + halfSize.x;
        let x_low = position.x - halfSize.x;
        let y_high = position.y + halfSize.y;
        let y_low = position.y - halfSize.y;
        return (mousePos.x > x_low && mousePos.x < x_high) &&
               (mousePos.y > y_low && mousePos.y < y_high);
    }

    canInsert(): boolean {
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (this.entityAtMousePos(entity) && entity.tag != 'dec') {
                return false;
            }
        }

        return true;
    }

    canDropEntity(toBeDropped: Entity): boolean {
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (this.entityAtMousePos(entity) &&
                (entity.id != toBeDropped.id) &&
                (entity.tag != 'dec')) {
                return false;
            }
        }

        return true;
    }

    displayNextAnimationForSelectedEntity(direction: string) {
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (!entity.hasComponent(CDraggable)) {
                continue;
            }

            if (entity.getComponent(CDraggable).isBeingDragged) {
                let animationNames = getAnimationsByTag(entity.tag);
                let draggable = entity.getComponent(CDraggable);

                if (direction === 'left') {
                    draggable.animationIndex = draggable.animationIndex - 1;
                }
                else {
                    draggable.animationIndex = draggable.animationIndex + 1;
                }

                if (draggable.animationIndex < 0) {
                    // $FlowFixMe
                    draggable.animationIndex = animationNames.length - 1;
                }

                // $FlowFixMe
                if (draggable.animationIndex >= animationNames.length) {
                    draggable.animationIndex = 0;
                }

                // $FlowFixMe
                let newAnimation = new CAnimation(animationNames[draggable.animationIndex], true);
                entity.addComponent(newAnimation);
            }
        }
    }

    changeBackground() {
        // $FlowFixMe
        let backgrounds = getAnimationsByTag('background');
        // $FlowFixMe
        let index = backgrounds.indexOf(this.background) + 1;

        if (index < 0) {
            // $FlowFixMe
            index = backgrounds.length - 1;
        }

        // $FlowFixMe
        if (index >= backgrounds.length) {
            index = 0;
        }

        // $FlowFixMe
        this.game.setBackground(backgrounds[index]);
        // $FlowFixMe
        this.background = backgrounds[index];
    }

    deleteSelectedEntity() {
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (!entity.hasComponent(CDraggable)) {
                continue;
            }

            if (entity.getComponent(CDraggable).isBeingDragged) {
                entity.destroy();
            }
        }
    }

    getMousePosition(): Vec {
        let inputMap = this.game.getInputMap();
        let playerPos = this.player.getComponent(CTransform).pos;
        let px = playerPos.x - 512;
        let py = playerPos.y - 288;
        return new Vec(inputMap.mousePos[0] + px,
                       inputMap.mousePos[1] + py);
    }
}

module.exports = GameState_LevelEditor;
