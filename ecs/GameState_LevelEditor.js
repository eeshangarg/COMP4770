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

class GameState_LevelEditor extends GameState {
    game: GameEngine;
    entityManager: EntityManager;
    editor: Entity;
    update: void => void;

    constructor(game: GameEngine) {
        super();
        this.game = game;
        this.entityManager = new EntityManager();
        this.editor = this.entityManager.addEntity("editor");
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
        this.editor.addComponent(new CTransform(new Vec(0, 0)));
        this.editor.addComponent(new CAnimation("playerRun", true));
        this.editor.addComponent(new CInput());
    }

    update() {
        this.entityManager.update();
        this.sMovement();
        this.sAnimation();
        this.sUserInput();
        this.sEdit();
        this.sDrag();
        this.sRender();
    }

    sUserInput() {
        // TODO: Process all user input here
        let inputMap = this.game.getInputMap();
        let playerInput = this.editor.getComponent(CInput);
        if (inputMap.escape){
            this.game.popState();
        }

        let playerPos = this.editor.getComponent(CTransform).pos;
        let px = playerPos.x - 512;
        let py = playerPos.y - 288;

        playerInput.up = inputMap.w;
        playerInput.down = inputMap.s;
        playerInput.left = inputMap.a;
        playerInput.placeTile = inputMap.space;
        playerInput.right = inputMap.d;
        playerInput.mousePos = new Vec (inputMap.mousePos[0] + px, inputMap.mousePos[1] + py);
    }

    sMovement() {
        // TODO: Process the player's movement here.
        // Note that the player should still be able to move around
        // so that the user can navigate the level canvas.
        let playerInput = this.editor.getComponent(CInput);

        // Example
        if (playerInput.up) {
            this.editor.getComponent(CTransform).pos.y += 3;
        }
        else if (playerInput.down) {
            this.editor.getComponent(CTransform).pos.y -= 3;
        }

        if (playerInput.left) {
            this.editor.getComponent(CTransform).pos.x -= 3;
            this.editor.getComponent(CTransform).facing = -1;
        } else if (playerInput.right) {
            this.editor.getComponent(CTransform).pos.x += 3;
            this.editor.getComponent(CTransform).facing = 1;
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
        let editorPos = this.editor.getComponent(CTransform).pos;
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

    // A helper system to call other editors sub-systems off.
    sEdit() {
        let playerInput = this.editor.getComponent(CInput);
        if (playerInput.placeTile){
            let tile = this.entityManager.addEntity("tile");
            tile.addComponent(new CTransform(playerInput.mousePos));
            tile.addComponent(new CAnimation("playerDeath", true));
        }
    }

    sDrag() {
        // TODO: Support dragging existing entities on the canvas
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
    }

    displayNextAnimationForSelectedEntity() {
        // TODO: This function should take the currently selected entity and
        // depending on the tag of the entity, should toggle the next possible
        // animation for this type of entity.

        // KEY: arrow keys to cycle through entities.

        // NOTE: This function may take in additional arguments. Also, we'll probably
        // need some sort of mapping from tags to the possible animations they can have.
        // Feel free to define maps at the top of this file.
    }

    deleteSelectedEntity() {
        // TODO: Delete the entity that is currently being dragged around/is selected.

        // KEY: The Delete key.
    }

    saveLevel() {
        // TODO: Save the level to a JSON file or to the database (Mike)

        // KEY: Ctrl + S ??
    }

    getCursorPosition(): Vec {
        // TODO: Return a Vec of the current position of the cursor.
        // A lot of the functionality of the level editor depends on this.

        // Example
        return new Vec(0.0, 2.0);
    }
}

module.exports = GameState_LevelEditor;
