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
const { isOnScreen } = require('./Physics.js');

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


    loadLevel() {

        this.game.setBackground(this.background);
        this.spawnEditor(this.playerSpawn);

        let tiles = this.level.entities.tiles;
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            let newTile = this.entityManager.addEntity("tile");
            newTile.addComponent(new CTransform(new Vec(tile.pos[0],tile.pos[1])));
            newTile.addComponent(new CAnimation(tile.sprite, true));
            newTile.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }

        // TO-DO adjust for NPC implementation. Boiler-plate.
        let npcs = this.level.entities.npcs;
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            if (npc.name === "cowman") {
                let newNpc = this.entityManager.addEntity("npc");
                newNpc.addComponent(new CTransform(new Vec(npc.pos[0],npc.pos[1])));
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[0], true));
                newNpc.addComponent(new CBoundingBox(new Vec(50, 50), true, true));
            } else if (npc.name === "imp") {
                let newNpc = this.entityManager.addEntity("npc");
                newNpc.addComponent(new CTransform(new Vec(npc.pos[0],npc.pos[1])));
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[1], true));
                newNpc.addComponent(new CBoundingBox(new Vec(50, 50), true, true));
            } else if (npc.name === "goblin") {
                let newNpc = this.entityManager.addEntity("npc");
                newNpc.addComponent(new CTransform(new Vec(npc.pos[0],npc.pos[1])));
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[2], true));
                newNpc.addComponent(new CBoundingBox(new Vec(50, 50), true, true));
            }

        }

        // TO-DO adjust for item implementation. Boiler-plate.
        let items = this.level.entities.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let newItem = this.entityManager.addEntity("item");
            newItem.addComponent(new CTransform(new Vec(item.pos[0],item.pos[1])));
            newItem.addComponent(new CAnimation(item.sprite, true));
            newItem.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }

        let decorations = this.level.entities.decs;
        for (let i = 0; i < items.length; i++) {
            let decoration = decorations[i];
            let newDec = this.entityManager.addEntity('dec');
            newDec.addComponent(new CTransform(new Vec(decoration.pos[0], decoration.pos[1])));
            newDec.addComponent(new CAnimation(decoration.sprite, true));
        }
    }

    parseLevel() {

        let tileParse = []
        let tiles = this.entityManager.getEntitiesByTag("tile");
        if (tiles != null) {
            for (let i = 0; i < tiles.length; i++) {
                let tile = tiles[i];
                let pos = tile.getComponent(CTransform).pos;
                let name = tile.getComponent(CAnimation).animation.name;
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
                let name = npc.getComponent(CAnimation).animation.name;
                if (name === "cowmanIdle"){
                     npcParse.push({pos:[pos.x,pos.y], name:"cowman"});
                }
                else if (name === "impIdle") {
                    npcParse.push({pos:[pos.x,pos.y], name:"imp"});
                } else if (name === "goblinIdle"){
                    npcParse.push({pos:[pos.x,pos.y], name:"goblin"});
                }
               
            }
        }

        // TO-DO adjust for Item implementation. Boiler-plate.
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
            playerSpawn: [this.playerSpawn.x, this.playerSpawn.y],
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

    spawnEditor(pos: Vec) {
        this.player.addComponent(new CTransform(pos));
        this.player.addComponent(new CInput());
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

        // TODO: Process all user input here
        let inputMap = this.game.getInputMap();
        let playerInput = this.player.getComponent(CInput);

        if (inputMap.escape){
            this.game.popState();
        }

        if (inputMap.ctrl && inputMap.enter) {
            this.parseLevel();
            this.game.popState();
        }

        playerInput.up = inputMap.w;
        playerInput.left = inputMap.a;
        playerInput.down = inputMap.s;
        playerInput.right = inputMap.d;

        if (inputMap.t) {
            this.insertTile();
        }

        if (inputMap.n) {
            this.insertNPC();
        }

        if (inputMap.click) {
            this.dragOrDropEntity();
            inputMap.click = 0;
        }

        if (inputMap.arrowLeft) {
            this.displayNextAnimationForSelectedEntity('left');
        }

        if (inputMap.arrowRight) {
            this.displayNextAnimationForSelectedEntity('right');
        }

        if (inputMap.g) {
            this.gridMode = !this.gridMode;
        }

        if (inputMap.del) {
            this.deleteSelectedEntity();
        }
    }

    sMovement() {
        // TODO: Process the player's movement here.
        // Note that the player should still be able to move around
        // so that the user can navigate the level canvas.
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
        // TODO: Handle all rendering here.
        let editorPos = this.player.getComponent(CTransform).pos;
        let entities = this.entityManager.getAllEntities();
        let len = entities.length;
        for (let i = 0; i < len; i++) {
            // Only draw entities with Animations.
            if (entities[i].hasComponent(CAnimation)){
                let pos = entities[i].getComponent(CTransform).pos;
                // Use culling to rapidly remove non-onscreen entites.
                if (editorPos.distf(pos) < 360000) {
                    let dir = entities[i].getComponent(CTransform).facing;
                    let anim = entities[i].getComponent(CAnimation).animation;
                    this.game.draw(anim, dir, pos);
                }
            }
        }
        this.game.drawFrame(editorPos);
    }

    sDrag() {
        // TODO: Support dragging existing entities on the canvas
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
        // TODO: Insert an NPC entity at the current cursor position.
        // This funciton will take care of adding an entity and setting up the
        // required components the entity should have depending on what animation
        // (Imp, Elf, etc) the user selects.

        // KEY: called when the user presses N.
        let npc = this.entityManager.addEntity("npc");
        npc.addComponent(new CTransform(this.getMousePosition()));
        npc.addComponent(new CDraggable());
        // $FlowFixMe
        npc.addComponent(new CAnimation(getAnimationsByTag('npc')[0], true));
        let animation = npc.getComponent(CAnimation);
        let bounds = new Vec(animation.width, animation.height);
        npc.addComponent(new CBoundingBox(bounds, true, true));
    }

    insertTile() {
        // TODO: Insert a tile entity at the current cursor position.

        // KEY: called when the user presses T.
        let tile = this.entityManager.addEntity("tile");
        tile.addComponent(new CTransform(this.getMousePosition()));
        tile.addComponent(new CDraggable());
        // $FlowFixMe
        tile.addComponent(new CAnimation(getAnimationsByTag('tile')[0], true));
        tile.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
    }

    insertDecoration() {
        // TODO: Insert a decorative entity at the current cursor position.

        // KEY: called when the user presses E, not ethat we can't use D,
        // since it is used for movement.
    }

    insertItem() {
        // TODO: Insert an item at the current cursor position.

        // KEY: called when the user presses I.
    }

    dragOrDropEntity() {
        // TODO: This function should either pick up an entity that the cursor
        // is resting on or drop an already selected one. This function should also
        // take into account whether Snap To Grid mode is on.

        // NOTE: This function may take in additional arguments.
        let mousePos = this.getMousePosition();
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (!entity.hasComponent(CDraggable)) {
                continue;
            }


            let position = entity.getComponent(CTransform).pos;
            let halfSize = entity.getComponent(CBoundingBox).halfSize;
            let draggable = entity.getComponent(CDraggable);
            let x_high = position.x + halfSize.x;
            let x_low = position.x - halfSize.x;
            let y_high = position.y + halfSize.y;
            let y_low = position.y - halfSize.y;


            if ((mousePos.x > x_low && mousePos.x < x_high) &&
                (mousePos.y > y_low && mousePos.y < y_high))
            {
                draggable.isBeingDragged = !draggable.isBeingDragged;
            }
        }
    }

    displayNextAnimationForSelectedEntity(direction: string) {
        // TODO: This function should take the currently selected entity and
        // depending on the tag of the entity, should toggle the next possible
        // animation for this type of entity.

        // KEY: arrow keys to cycle through entities.

        // NOTE: This function may take in additional arguments. Also, we'll probably
        // need some sort of mapping from tags to the possible animations they can have.
        // Feel free to define maps at the top of this file.
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

    deleteSelectedEntity() {
        // TODO: Delete the entity that is currently being dragged around/is selected.

        // KEY: The Delete key.
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

    saveLevel() {
        // TODO: Save the level to a JSON file or to the database (Mike)

        // KEY: Ctrl + S ??
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
