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
const Physics = require('./Physics.js');
const Vec = require('./Vec.js');
const getAnimationsByTag = require('./../rendering/Rendering.js').getAnimationsByTag;

class GameState_LevelEditor extends GameState {
    game: GameEngine;
    entityManager: EntityManager;
    editor: Entity;
    update: void => void;
    gridMode: boolean;
    level: Object;
    background: string;
    playerSpawn: Entity;
    levelObjective: Entity;
    dragging: boolean;
    lastHeldTile: string;
    tileIndex: number;

    constructor(game: GameEngine, level: Object) {
        super();
        this.game = game;
        this.entityManager = new EntityManager();
        this.level = level;
        this.background = level.background;
        this.level = level;
        this.dragging = false;
        this.gridMode = false;
        this.tileIndex = 0;
        this.lastHeldTile = "cave-platform";
        this.editor = this.entityManager.addEntity("editor");
        this.playerSpawn = this.entityManager.addEntity("playerSpawn");
        this.levelObjective = this.entityManager.addEntity("levelObjective");
        this.init();
    }

    init() {

        this.loadLevel();

        let editorPos = new Vec(this.level.playerSpawn[0], this.level.playerSpawn[1]);
        this.spawnPlayer(editorPos);
        this.playerSpawn.addComponent(new CTransform(editorPos));
        this.playerSpawn.addComponent(new CBoundingBox(new Vec(50, 50), true, true));
        this.playerSpawn.addComponent(new CAnimation("playerIdle", true));
        this.playerSpawn.addComponent(new CDraggable());

        let levelPos = new Vec(this.level.levelObjective[0], this.level.levelObjective[1]);
        this.levelObjective.addComponent(new CTransform(levelPos));
        this.levelObjective.addComponent(new CBoundingBox(new Vec(64, 64), true, true));
        this.levelObjective.addComponent(new CAnimation("objective", true));
        this.levelObjective.addComponent(new CDraggable());

        this.game.drawText("Camera pos:[" + editorPos.x + "," + editorPos.y + "]", 'p','16px PS2P', '#F9F9F9', 650, 22);
        this.game.drawText("Grid Mode: OFF", 'gridText','16px PS2P', '#F9F9F9', 20, 22);
    }


    // $FlowFixMe
    loadLevel() {

        this.game.setBackground(this.background);

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
            else if (npc.name === "iceman") {
                newNpc.addComponent(new CAnimation("icemanIdle", true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
            }
            else if (npc.name === "exe") {
                newNpc.addComponent(new CAnimation("exeIdle", true));
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
        let playerPos = this.playerSpawn.getComponent(CTransform).pos;
        let objectivePos = this.levelObjective.getComponent(CTransform).pos;

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
                else if (name === "icemanIdle") {
                    npcParse.push({pos:[pos.x,pos.y], name:"iceman"});
                }
                else if (name === "exeIdle") {
                    npcParse.push({pos:[pos.x,pos.y], name:"exe"});
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
            playerSpawn: [playerPos.x, playerPos.y],
            levelObjective: [objectivePos.x, objectivePos.y],
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
        this.editor.addComponent(new CTransform(new Vec(pos.x, pos.y)));
        this.editor.addComponent(new CInput());
        this.editor.addComponent(new CBoundingBox(new Vec(0,0), true, true));
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
        let editorInput = this.editor.getComponent(CInput);

        if (inputMap.escape){
            inputMap.escape = 0;
            this.game.clearText('all');
            this.game.popState();
        }

        if (inputMap.ctrl && inputMap.enter) {
            inputMap.enter = 0;
            inputMap.ctrl = 0;
            this.parseLevel();
            this.game.clearText('all');
            this.game.popState();
        }

        editorInput.up = inputMap.w;
        editorInput.left = inputMap.a;
        editorInput.down = inputMap.s;
        editorInput.right = inputMap.d;

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
            if (this.gridMode) {
                this.game.drawText("Grid Mode: ON", 'gridText','16px PS2P', '#00FF00', 20, 22);
            }
            else {
                this.game.drawText("Grid Mode: OFF", 'gridText','16px PS2P', '#F9F9F9', 20, 22);
            }
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
        let editorInput = this.editor.getComponent(CInput);

        if (editorInput.up) {
            this.editor.getComponent(CTransform).pos.y += 3;
        }
        else if (editorInput.down) {
            this.editor.getComponent(CTransform).pos.y -= 3;
        }

        if (editorInput.left) {
            this.editor.getComponent(CTransform).pos.x -= 3;
            this.editor.getComponent(CTransform).facing = -1;
        } else if (editorInput.right) {
            this.editor.getComponent(CTransform).pos.x += 3;
            this.editor.getComponent(CTransform).facing = 1;
        }

        let pos = this.editor.getComponent(CTransform).pos;

        this.game.drawText("Camera pos:[" + pos.x + "," + pos.y + "]", 'p','16px PS2P', '#F9F9F9', 650, 22);
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
        let editorInput = this.editor.getComponent(CTransform).pos;
        this.renderEntitiesByTag('dec');
        this.renderEntitiesByTag('tile');
        this.renderEntitiesByTag('item');
        this.renderEntitiesByTag('npc');
        this.renderEntitiesByTag('playerSpawn');
        this.renderEntitiesByTag('levelObjective');
        this.game.drawFrame(editorInput);
    }

    renderEntitiesByTag(tag: string) {
        let editorPos = this.editor.getComponent(CTransform).pos;
        let entities = this.entityManager.getEntitiesByTag(tag);

        if (entities === undefined) {
            return;
        }

        let len = entities.length;
        for (let i = 0; i < len; i++) {
            let entity = entities[i];
            // Only draw entities with Animations.
            if (entities[i].hasComponent(CAnimation)){
                let pos = entity.getComponent(CTransform).pos;
                // Use culling to rapidly remove non-onscreen entites.
                if (Physics.isOnScreen(entity, editorPos, this.game.screenSize)) {
                    let dir = entity.getComponent(CTransform).facing;
                    let anim = entity.getComponent(CAnimation).animation;
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
        tile.addComponent(new CAnimation(this.lastHeldTile, true));
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
                    this.dragging = false;
                }
                else if (!draggable.isBeingDragged && !this.dragging) {
                    draggable.isBeingDragged = true;
                    this.dragging = true;
                    if (entity.tag === "tile") {
                        this.lastHeldTile = entity.getComponent(CAnimation).animation.name;
                    }
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


                if (entity.tag === 'levelObjective' || entity.tag === 'playerSpawn') {
                    continue;
                }

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

                if (entity.tag === "tile") {
                    this.lastHeldTile = entity.getComponent(CAnimation).animation.name;
                }
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
            if (!entity.hasComponent(CDraggable) || entity.tag === 'levelObjective' || entity.tag === 'playerSpawn') {
                continue;
            }
            this.dragging = false;
            if (entity.getComponent(CDraggable).isBeingDragged) {
                entity.destroy();
            }
        }
    }

    getMousePosition(): Vec {
        let inputMap = this.game.getInputMap();
        let editorPos = this.editor.getComponent(CTransform).pos;
        let px = editorPos.x - 512;
        let py = editorPos.y - 288;
        return new Vec(inputMap.mousePos[0] + px,
                       inputMap.mousePos[1] + py);
    }
}

module.exports = GameState_LevelEditor;
