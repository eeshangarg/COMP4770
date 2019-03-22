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

    constructor(game: GameEngine) {
        super();
        this.game = game;
        this.entityManager = new EntityManager();
        this.player = this.entityManager.addEntity("player");
        this.gridMode = false;
        this.init();
    }

    init() {
        this.game.setBackground('bg_green');
        this.spawnAllEntities();
    }

    spawnAllEntities() {
        // TODO: Spawn one entity of each type so that the user
        // can play around with them
        let tile = this.entityManager.addEntity("tile");
        tile.addComponent(new CTransform(new Vec(0, 0)));
        tile.addComponent(new CAnimation("cave-platform", true));
        this.player.addComponent(new CTransform(new Vec(0, 0)));
        this.player.addComponent(new CAnimation("playerRun", true));
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

        playerInput.up = inputMap.w;
        playerInput.left = inputMap.a;
        playerInput.down = inputMap.s;
        playerInput.right = inputMap.d;

        if (inputMap.t) {
            this.insertTile();
        }

        if (inputMap.click) {
            this.dragOrDropEntity();
            inputMap.click = false;
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
        for (let i = 0; i < entities.length; i++) {
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
