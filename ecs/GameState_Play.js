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
const Vec = require('./Vec.js');
const Physics = require('./Physics.js');
const getAnimationsByTag = require('./../rendering/Rendering.js').getAnimationsByTag;
const {
    CTransform,
    CAnimation,
    CBoundingBox,
    CInput,
    CState,
    CGravity,
    CMeele,
    CFollow,
    CHealth,
    CMagic,
    CRanged,
    CLifespan,
    CProjectile
} = require('./Components.js');

class GameState_Play extends GameState {
    game: GameEngine;
    entityManager: EntityManager;
    paused: boolean;
    player: Entity;
    update: void => void;
    level: Object;
    background: string;
    playerSpawn: Vec;
    levelObjective: Entity;
    currentHP: number;
    currentMP: number;
    score: number;
    prevScore: number;
    gameOver: boolean;


    constructor(game: GameEngine, level: Object) {
        super();
        this.game = game;
        this.entityManager = new EntityManager();
        this.level = level;
        this.background = level.background;
        this.playerSpawn = new Vec(level.playerSpawn[0], level.playerSpawn[1]);
        this.paused = false;
        this.score = 0;
        this.prevScore = 0;
        this.player = this.entityManager.addEntity("player");
        this.levelObjective = this.entityManager.addEntity("levelObjective");
        this.init();
    }

    init() {
        this.entityManager = new EntityManager();
        this.levelObjective = this.entityManager.addEntity("levelObjective");
        this.game.clearText("all");
        this.gameOver = false;
        this.score = 0;
        this.prevScore = 0;
        let levelPos = new Vec(this.level.levelObjective[0], this.level.levelObjective[1]);
        this.levelObjective.addComponent(new CTransform(levelPos));
        this.levelObjective.addComponent(new CBoundingBox(new Vec(64, 64), true, true));
        this.levelObjective.addComponent(new CAnimation("objective", true));
        this.loadLevel();
    }


    loadLevel() {

        this.game.setBackground(this.background);

        // Parse in all Tiles from level file. 
        let tiles = this.level.entities.tiles;
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            let newTile = this.entityManager.addEntity("tile");
            newTile.addComponent(new CTransform(new Vec(tile.pos[0], tile.pos[1])));
            newTile.addComponent(new CAnimation(tile.sprite, true));
            newTile.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }

        // Parse in all NPC's from level file.
        let npcs = this.level.entities.npcs;
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            let newNpc = this.entityManager.addEntity("npc");
            newNpc.addComponent(new CTransform(new Vec(npc.pos[0], npc.pos[1])));

            // Create a goblin Cowman, assign all components.
            if (npc.name === "cowman") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[0], true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
                newNpc.addComponent(new CState('idle'));
                newNpc.addComponent(new CGravity(0.3));
                newNpc.addComponent(new CHealth(100));
                newNpc.addComponent(new CMeele(20, new Vec(35, 42), 1500, 75, 20, 4, 7));
                newNpc.addComponent(new CFollow(new Vec(npc.pos[0], npc.pos[1]), 50, 500, 2.5, true));
            }
            // Create a imp NPC, assign all components.
            else if (npc.name === "imp") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[2], true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
                newNpc.addComponent(new CState('idle'));
                newNpc.addComponent(new CGravity(0.0));
                newNpc.addComponent(new CHealth(50));
                newNpc.addComponent(new CRanged(500, 2000));
                newNpc.addComponent(new CFollow(new Vec(npc.pos[0], npc.pos[1]), 150, 750, 2, false));
            }
            // Create a goblin NPC, assign all components.
            else if (npc.name === "goblin") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation(getAnimationsByTag('npc')[1], true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(Math.round(anim.width * 0.85), Math.round(anim.height * 0.9)), true, true));
                newNpc.addComponent(new CState('idle'));
                newNpc.addComponent(new CGravity(0.3));
                newNpc.addComponent(new CHealth(50));
                newNpc.addComponent(new CMeele(5, new Vec(25, 10), 1000, 60, 10, 1, 3));
                newNpc.addComponent(new CFollow(new Vec(npc.pos[0], npc.pos[1]), 30, 350, 2, true));
            }
            // Create a iceman, assign all of its need components.
            else if (npc.name === "iceman") {
                // $FlowFixMe
                newNpc.addComponent(new CAnimation("icemanIdle", true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(Math.round(anim.width * 0.85), Math.round(anim.height * 0.9)), true, true));
                newNpc.addComponent(new CState('idle'));
                newNpc.addComponent(new CGravity(0.3));
                newNpc.addComponent(new CHealth(200));
                newNpc.addComponent(new CMeele(25, new Vec(25, 40), 2000, 75, 20, 3, 5));
                newNpc.addComponent(new CFollow(new Vec(npc.pos[0], npc.pos[1]), 50, 500, 0.75, false));
            }
            // Create a executioner, assign all of its need components.
            else if (npc.name === "exe") {
                newNpc.addComponent(new CAnimation("exeIdle", true));
                let anim = newNpc.getComponent(CAnimation).animation;
                newNpc.addComponent(new CBoundingBox(new Vec(Math.round(anim.width * 0.85), Math.round(anim.height * 0.9)), true, true));
                newNpc.addComponent(new CState('idle'));
                newNpc.addComponent(new CGravity(0.3));
                newNpc.addComponent(new CHealth(150));
                newNpc.addComponent(new CMeele(25, new Vec(25, 60), 1800, 75, 25, 2, 4));
                newNpc.addComponent(new CFollow(new Vec(npc.pos[0], npc.pos[1]), 65, 500, 1.5, true));
            }

        }

        // Parse in all item from level file.
        let items = this.level.entities.items;
        for (let i = 0; i < items.length; i++) {
            let item = items[i];
            let newItem = this.entityManager.addEntity("item");
            newItem.addComponent(new CTransform(new Vec(item.pos[0], item.pos[1])));
            newItem.addComponent(new CAnimation(item.sprite, true));
            newItem.addComponent(new CBoundingBox(new Vec(16, 16), true, true));
        }

        // Parse in all decs from level file.
        let decorations = this.level.entities.decs;
        for (let i = 0; i < decorations.length; i++) {
            let decoration = decorations[i];
            let newDec = this.entityManager.addEntity('dec');
            newDec.addComponent(new CTransform(new Vec(decoration.pos[0], decoration.pos[1])));
            newDec.addComponent(new CAnimation(decoration.sprite, true));
            let anim = newDec.getComponent(CAnimation).animation
            newDec.addComponent(new CBoundingBox(new Vec(anim.width, anim.height), true, true));
        }

        this.spawnPlayer();
        this.game.drawText("Health: "+ this.currentHP  , 'hp','16px PS2P', '#FF0909', 20, 22);
        this.game.drawText("MP: " + this.currentMP  , 'mp','16px PS2P', '#0D09E3', 20, 44);
        this.game.drawText("Score: " + this.score  , 's','16px PS2P', '#00FF00', 800, 20);
    }


    spawnPlayer() {
        this.player = this.entityManager.addEntity("player");
        this.player.addComponent(new CTransform(new Vec(this.level.playerSpawn[0], this.level.playerSpawn[1])));
        this.player.addComponent(new CAnimation('playerIdle', true));
        this.player.addComponent(new CBoundingBox(new Vec(35, 45), true, true));
        this.player.addComponent(new CGravity(0.3));
        this.player.addComponent(new CState('idle'));
        this.player.addComponent(new CInput());
        this.player.addComponent(new CMeele(25, new Vec(20, 30), 0, 0, 15, 6, 11));
        this.player.addComponent(new CHealth(100));
        this.player.addComponent(new CMagic(100));
        this.currentHP = 100;
        this.currentMP = 100;
    }

    update() {
        this.entityManager.update();
        this.sUserInput();

        if (!this.gameOver) {
            this.sAI();
            this.sMovement();
            this.sLifespan();
            this.sCollision();
            this.sPlayerMeele();
            this.sHealth();
            this.sMagic();
            this.sAnimation();
        }
        else {
            this.sLifespan();
            this.sAnimation();
        }

        this.sRender();

    }

    sUserInput() {
        // TODO: Process all user input here
        let inputMap = this.game.getInputMap();
        let playerInput = this.player.getComponent(CInput);

        if (inputMap.escape) {
            inputMap.escape = 0;
            this.game.clearText('all');
            this.game.popState();
        }

        if (inputMap.space) {
            inputMap.space = 0;
            let state = this.player.getComponent(CState).state;
            if (state !== 'dying' || state != 'hurt') {
                this.player.getComponent(CState).state = 'attacking';
            }
        }

        if (inputMap.q) {
            inputMap.q = 0;
            let state = this.player.getComponent(CState).state;
            if (state !== 'dying' || state != 'hurt') {
                this.handlePotion();
            }
        }

        if (inputMap.e) {
            inputMap.e = 0; 
            let state = this.player.getComponent(CState).state;
            if (state !== 'dying' || state != 'hurt') {
                this.playerFireball();
            }
        }

        if (inputMap.r && this.gameOver) {
            inputMap.r =0;
            this.init();
        }

        playerInput.up = inputMap.w;
        playerInput.down = inputMap.s;
        playerInput.left = inputMap.a;
        playerInput.right = inputMap.d;
    }



    //##### TODO STUB ####
    playerFireball() {
        let canMagic = this.player.getComponent(CMagic).canMagic;
        if (canMagic && this.player.getComponent(CMagic).mp >= 10) {
            this.player.getComponent(CMagic).canMagic = false;
            this.player.getComponent(CMagic).clock.start(true);
            let facing = this.player.getComponent(CTransform).facing;
            let fireball = this.entityManager.addEntity('projectile');
            let playerPos = this.player.getComponent(CTransform).pos;
            let fireballPos = new Vec(playerPos.x + 10 * facing, playerPos.y + 10);
            fireball.addComponent(new CTransform(fireballPos));
            fireball.addComponent(new CProjectile(25, true));
            fireball.addComponent(new CBoundingBox(new Vec(25, 25), false, false));
            fireball.addComponent(new CAnimation("playerFireball",true));
            fireball.addComponent(new CLifespan(2000));
            fireball.getComponent(CTransform).speed.x = 7 * facing;
            fireball.getComponent(CTransform).facing = facing;
            this.game.playSound("playerFireball");
            this.player.getComponent(CMagic).mp -= 10;
        }
    }

    //##### TODO STUB ####
    handlePotion() {
        this.game.playSound("playerPotion");
        this.player.getComponent(CHealth).health += 25;
    }


    // A helper system to hanlde player meele-attack.
    sPlayerMeele() {

        // Only execute this system if the player is currently attacking.
        if (this.player.getComponent(CState).state === 'attacking') {
            let meele = this.player.getComponent(CMeele);
            let currentFrame = this.player.getComponent(CAnimation).animation.animationFrame;

            // If the current frame of the animations is with the "Hit" frames.
            if (currentFrame > meele.frameStart && currentFrame < meele.frameEnd) {

                let playerPos = this.player.getComponent(CTransform).pos;

                // Check every NPC for a meele col.
                let npcs = this.entityManager.getEntitiesByTag("npc");
                for (let i = 0; i < npcs.length; i++) {
                    let npc = npcs[i];
                    let state = npc.getComponent(CState).state;
                    let facing = this.player.getComponent(CTransform).facing;
                    let offSetPos = new Vec(playerPos.x + (meele.offset * facing), playerPos.y);
                    if (Physics.isOverlapping(offSetPos, meele.halfSize, npc) && state !== 'hurt' && state !== 'dying') {
                        npc.getComponent(CHealth).health -= meele.damage;
                        npc.getComponent(CState).state = 'hurt';
                    }
                }
            }
        }
    }

    sMovement() {

        let playerInput = this.player.getComponent(CInput);
        let playerState = this.player.getComponent(CState);
        let playerTransform = this.player.getComponent(CTransform);
        playerTransform.prevPos = new Vec(playerTransform.pos.x, playerTransform.pos.y);

        // Check to see if player has fallen off the map.
        if (playerTransform.pos.y < -999) {
            this.player.getComponent(CHealth).health = 0;
            this.player.getComponent(CState).state = 'dying';
        }

        // Handle the L/R input of the player.
        if (playerInput.left) {
            playerTransform.speed.x -= 3;
            playerTransform.facing = -1;
        } else if (playerInput.right) {
            playerTransform.speed.x += 3;
            playerTransform.facing = 1;
        }

        // If the player is in state running or Idle, update state based off speed.
        if (playerState.state === 'running' || playerState.state === 'idle') {
            if (playerTransform.speed.x !== 0) {
                playerState.state = 'running';
            } else {
                playerState.state = 'idle';
            }
        }

        // only allow the player to jump if they are grounded.
        if (playerInput.up && playerState.grounded) {
            this.game.playSound('playerJump');
            playerState.grounded = false;
            playerInput.up = 0;
            playerTransform.speed.y += 7.5;
        }

        // Cap the players Y speed to +/- 10
        if (playerTransform.speed.y > 10) {
            playerTransform.speed.y = 10;
        } else if (playerTransform.speed.y < -10) {
            playerTransform.speed.y = -10;
        }

        // Update the player pos based off speed.
        playerTransform.speed.y -= this.player.getComponent(CGravity).gravity;
        playerTransform.pos.addi(playerTransform.speed);
        playerTransform.speed.x = 0;

        // Move all NPC's based off there speeds.
        let npcs = this.entityManager.getEntitiesByTag("npc");
        for (let j = 0; j < npcs.length; j++) {
            let npc = npcs[j];
            let transform = npc.getComponent(CTransform);

            // If the NPC isn't grounded, apply there gravity.
            if (!npc.getComponent(CState).grounded) {
                transform.prevPos = new Vec(transform.pos.x, transform.pos.y);
                transform.speed.y -= npc.getComponent(CGravity).gravity;

                // Cap the Y speed at +/- 10
                if (transform.speed.y > 10) {
                    transform.speed.y = 10;
                } else if (transform.speed.y < -10) {
                    transform.speed.y = -10;
                }

                // Add the speed to the NPC's pos.
                transform.pos.addi(transform.speed);
            }

            // If the NPC fell off the map, set state dying.
            if (transform.pos.y < -999) {
                npc.getComponent(CHealth).health = 0;
                npc.getComponent(CState).state = 'dying';
            }
        }

        let projectiles = this.entityManager.getEntitiesByTag('projectile');
        for (let j = 0; j < projectiles.length; j++) {
            let projectile = projectiles[j];
            let transform = projectile.getComponent(CTransform);
            transform.pos.addi(transform.speed);
        }
    }

    sAnimation() {
        let entities = this.entityManager.getAllEntities();
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (entity.hasComponent(CAnimation)) {
                let anim = entity.getComponent(CAnimation);
                if (!anim.repeated && anim.animation.hasEnded) {
                    entity.destroy();
                }
                else {
                    if (entity.hasComponent(CState) && entity.hasComponent(CAnimation)) {
                        this.handleStateAnimation(entity);
                    }
                        anim.animation.update();
                }
            }
        }
    }

    handleStateAnimation(e: Entity) {
        let state = e.getComponent(CState).state;
        let grounded = e.getComponent(CState).grounded;
        let animationName = e.getComponent(CAnimation).animation.name;
        let hasEnded = e.getComponent(CAnimation).animation.hasEnded;

        let startsWith = '';

        // Find the start of the Animation name.
        if (animationName.startsWith('cowman')) {
            startsWith = 'cowman';
        } 
        else if (animationName.startsWith('imp')) {
            startsWith = 'imp'
        } 
        else if (animationName.startsWith('goblin')) {
            startsWith = 'goblin'
        } 
        else if (animationName.startsWith('player')) {
            startsWith = 'player';
        }
        else if (animationName.startsWith('iceman')) {
            startsWith = 'iceman';
        }
        else if (animationName.startsWith('exe')) {
            startsWith = 'exe';
        }

        // If the current state is 'attacking'.
        if (state === 'attacking') {
            // Start playing the "Atk" animation if it is not started.
            if (animationName !== startsWith + 'Atk') {
                this.game.playSound(startsWith + 'Atk');
                e.addComponent(new CAnimation(startsWith + 'Atk', true));
            } else if (hasEnded) {
                e.getComponent(CState).state = 'idle';
                e.addComponent(new CAnimation(startsWith + 'Idle', true));
            }
        }

        // If the current state is falling And is not 'dying'.
        else if (!grounded && state !== 'dying' && state !== 'hurt') {
            if (animationName !== startsWith + 'Fall' && startsWith !== "imp") {
                e.addComponent(new CAnimation(startsWith + 'Fall', true));
            }
        }

        // If the current state is running, and the animations not playing, play the animation.
        else if (state === 'running' && animationName !== startsWith + 'Run') {
            e.addComponent(new CAnimation(startsWith + 'Run', true));
        }

        // If the current state is Idle, and the animations not playing, play the animation.
        else if (state === 'idle' && animationName !== startsWith + 'Idle') {
            e.addComponent(new CAnimation(startsWith + 'Idle', true));
        }

        // If the current state is  'hurt'.
        else if (state === 'hurt') {
            // Play the "pain" animation if it is not playing.
            if (animationName !== startsWith + 'Hurt') {

                // Spawn the correct blood color for the NPC type.
                let blood = this.entityManager.addEntity("effect");
                let pos = e.getComponent(CTransform).pos;
                blood.addComponent(new CTransform(pos));
                if (startsWith === "goblin" || startsWith === "exe") {
                    blood.addComponent(new CAnimation('blood_small_green', false));
                } 
                else if (startsWith === "iceman") {
                    blood.addComponent(new CAnimation('blood_small_blue', false));
                } 
                else {
                    blood.addComponent(new CAnimation('blood_small', false));
                }

                this.game.playSound(startsWith + 'Pain');
                this.game.playSound('goreSplat');
                e.addComponent(new CAnimation(startsWith + 'Hurt', true));
            }

            // If the pain animations is over, set the entity to idle.
            else if (hasEnded) {
                e.getComponent(CState).state = 'idle';
                e.addComponent(new CAnimation(startsWith + 'Idle', true));
            }

        }

        // If the current state is 'Dying'.
        else if (state === 'dying') {
            // If we are not playing the death animation, start it.
            if (animationName !== startsWith + 'Death') {

                // Spawn the correct blood color for the NPC type.
                let blood = this.entityManager.addEntity("effect");
                let pos = e.getComponent(CTransform).pos;
                blood.addComponent(new CTransform(pos));
                if (startsWith === "goblin" || startsWith === "exe") {
                    blood.addComponent(new CAnimation('blood_big_green', false));
                }
                else if (startsWith === "iceman") {
                    blood.addComponent(new CAnimation('blood_big_blue', false));
                } 
                else {
                    e.getComponent(CGravity).gravity = 0.3;
                    blood.addComponent(new CAnimation('blood_big', false));
                }

                this.game.playSound('goreSplat');
                this.game.playSound(startsWith + 'Death');
                e.addComponent(new CAnimation(startsWith + 'Death', true));
            }
            // If the death animation is over, kill the entity.
            else if (hasEnded) {
                e.destroy();
                // If the player is dead, got back to the menu.fc
                if (startsWith === 'player') {
                    this.gameOver = true;
                    this.game.drawText("Game Over", 'go','68px Seagram', '#FF0909', 360,  250);
                    this.game.drawText("Press ESC to leave or R to retry...", 'got','20px Seagram', '#FF0909', 360,  370);
                }
                else {
                    this.score += 100;
                }
            }
        }
    }



    sRender() {
        let playerPos = this.player.getComponent(CTransform).pos;
        this.renderEntitiesByTag('dec');
        this.renderEntitiesByTag('levelObjective');
        this.renderEntitiesByTag('player');
        this.renderEntitiesByTag('npc');
        this.renderEntitiesByTag('effect');
        this.renderEntitiesByTag('item');
        this.renderEntitiesByTag('tile');
        
        this.renderEntitiesByTag('projectile');
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
            if (entities[i].hasComponent(CAnimation)) {
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

    sAI() {
        //*********** TO-DO STUB *************
        let npcs = this.entityManager.getEntitiesByTag("npc");
        let len = npcs.length;
        for (let i = 0; i < len; i++) {
            let npc = npcs[i];
            if (npc.hasComponent(CMeele)) {
                this.handleMeele(npc);
            }
            if (npc.hasComponent(CRanged)) {
                this.handleRanged(npc);
            }
            if (npc.hasComponent(CFollow)) {
                this.handleFollow(npc)
            }
            /* CPatrol ? */
        }

    }

    handleRanged(e: Entity) {
        let state = e.getComponent(CState).state;
        let vision = e.getComponent(CFollow).hasVision;
        let dist = e.getComponent(CTransform).pos.distf(this.player.getComponent(CTransform).pos);
        let ranged = e.getComponent(CRanged);

        if (state !== 'hurt' && state !== 'dying' && vision && dist <  ranged.range) {
            
            if (ranged.clock.elapsedTime > ranged.cooldown) {
                ranged.clock.stop();
                ranged.clock.elapsedTime = 0;
            }

            if (state === 'attacking') {
                let currentFrame = e.getComponent(CAnimation).animation.animationFrame;
                if (currentFrame === 4) {
                    this.lobProjectileAtPlayer(e, 4);
                    e.getComponent(CState).state = 'idle';
                }
            }
            else {
                let playerPos = this.player.getComponent(CTransform).pos;
                let entityPos = e.getComponent(CTransform).pos;
                if (playerPos.distf(entityPos) < ranged.range && ranged.clock.elapsedTime === 0) {
                    e.getComponent(CState).state = 'attacking';
                    ranged.clock.start(true);
                }
            }
        }
    }

    lobProjectileAtPlayer(entity: Entity, speed: number) {
        let entityPos = entity.getComponent(CTransform).pos;
        let target = this.player.getComponent(CTransform).pos;
        let D = target.subtract(entityPos);
        let theta = Math.atan2(D.y, D.x);
        let speedVec = new Vec(speed * Math.cos(theta), speed * Math.sin(theta));
        let projectile = this.entityManager.addEntity('projectile');
        projectile.addComponent(new CTransform(new Vec(entityPos.x, entityPos.y)));
        projectile.getComponent(CTransform).speed = new Vec(speedVec.x, speedVec.y);
        projectile.addComponent(new CAnimation('impProjectile', true));
        projectile.addComponent(new CLifespan(2000));
        projectile.addComponent(new CProjectile(10, false));
        let animation = projectile.getComponent(CAnimation).animation;
        let bounds = new Vec(animation.width, animation.height);
        projectile.addComponent(new CBoundingBox(bounds, true, true));
    }

    // The helper-function which handles executing the "CMeele" behaviour.
    handleMeele(e: Entity) {
        let state = e.getComponent(CState).state;
        if (state !== 'hurt' && state !== 'dying') {
            let meele = e.getComponent(CMeele);
            if (meele.clock.elapsedTime > meele.cooldown) {
                meele.clock.stop();
                meele.clock.elapsedTime = 0;
            }

            if (state === 'attacking') {
                let meele = e.getComponent(CMeele);
                let playerState = this.player.getComponent(CState).state;
                let pos = e.getComponent(CTransform).pos;
                let facing = e.getComponent(CTransform).facing;
                let offsetPos = new Vec (pos.x + (meele.offset * facing), pos.y);
                if (playerState !== 'dying' && playerState !== 'hurt') {
                    let currentFrame = e.getComponent(CAnimation).animation.animationFrame;
                    if (currentFrame > meele.frameStart && currentFrame < meele.frameEnd &&
                        Physics.isOverlapping(offsetPos, meele.halfSize, this.player)) {
                        this.player.getComponent(CState).state = 'hurt';
                        this.player.getComponent(CHealth).health -= meele.damage;
                    }
                }
            } else {
                let playerPos = this.player.getComponent(CTransform).pos;
                let entityPos = e.getComponent(CTransform).pos;
                if (playerPos.distf(entityPos) < meele.range && meele.clock.elapsedTime === 0) {
                    e.getComponent(CState).state = 'attacking';
                    meele.clock.start(true);
                }
            }
        }
    }

    // The helper-function which handles executing the "CFollow" behaviour.
    handleFollow(e: Entity) {
            let state = e.getComponent(CState).state;
            if (state !== 'hurt' && state !== 'dying' && state !== 'attacking') {
                let follow = e.getComponent(CFollow);
                let playerPos = this.player.getComponent(CTransform).pos;
                let entityPos = e.getComponent(CTransform).pos;
                let dist = playerPos.distf(entityPos);
                e.getComponent(CState).state = 'idle';
                if (dist < follow.visionDistance) {
                    let tiles = this.entityManager.getEntitiesByTag("tile");
                    follow.hasVision = true;
                    for (let i = 0; i < tiles.length; i++) {
                        if (Physics.entityIntersect(playerPos, entityPos,tiles[i])) {
                            follow.hasVision = false;
                            break;
                        }
                    }
                    if (follow.hasVision) {

                        if (dist > follow.approachDistance) {
                            e.getComponent(CState).state = 'running';
                            let entityTransform = e.getComponent(CTransform);
                            let diff = playerPos.subtract(entityPos);
                            let norm = diff.norm()
                            norm.muli(follow.speed);
                            entityTransform.prevPos = new Vec (entityTransform.pos.x, entityTransform.pos.y);
                            entityTransform.pos.x += norm.x;
                        }
                        else {
                            e.getComponent(CState).state = 'idle';
                        }

                        if (playerPos.x > entityPos.x) {
                            e.getComponent(CTransform).facing = 1;
                        } else {
                            e.getComponent(CTransform).facing = -1;
                        }
                    }
                    else if (follow.returnHome &&  Math.abs(follow.home.x - entityPos.x) > (follow.speed + 4)) {
                        let norm = follow.home.subtract(entityPos).norm();
                        norm.muli(follow.speed);
                        e.getComponent(CTransform).pos.x += norm.x;
                        e.getComponent(CState).state = "running";
                        if (entityPos.x < follow.home.x ) {
                            e.getComponent(CTransform).facing = 1;
                        } else {
                            e.getComponent(CTransform).facing = -1;
                        }
                    }
                    else {
                        e.getComponent(CState).state = "idle";
                    }
                }

            }
    }


    handleRectangularCollisions(a: Entity, b: Entity) {
        let currentFrameOverlap = Physics.getOverlap(a, b);
        if (currentFrameOverlap.x > 0.0 && currentFrameOverlap.y >= 0.0) {

            let bTransform = b.getComponent(CTransform);
            let aTransform = a.getComponent(CTransform);
            let prevFrameOverlap = Physics.getPreviousOverlap(a, b);
            let bPos = bTransform.pos;
            let aPos = aTransform.pos;
            let aPrevPos = aTransform.prevPos;

            // Check for Y Collisions.
            if (prevFrameOverlap.x > 0) {
                // Collision from the bottom.
                if (aPrevPos.y < bPos.y) {
                    aPos.y -= currentFrameOverlap.y;
                    aTransform.speed.y = 0;
                }
                // Check for Collision from the top.
                if (aPrevPos.y > bPos.y) {
                    aPos.y += currentFrameOverlap.y;
                    aTransform.speed.y = 0;
                    a.getComponent(CState).grounded = true;
                }
            }
            // Check for X Collisions.
            else if (prevFrameOverlap.y > 0) {
                // Collision from the right
                if (aPrevPos.x > bPos.x) {
                    aPos.x += currentFrameOverlap.x;
                    aTransform.speed.x = 0;
                }
                // Collision from the left
                if (aPrevPos.x < bPos.x) {
                    aPos.x -= currentFrameOverlap.x;
                    aTransform.speed.x = 0;
                }
            }
        }
    }

    sCollision() {
        let npcs = this.entityManager.getEntitiesByTag("npc");
        let tiles = this.entityManager.getEntitiesByTag("tile");
        let projectiles = this.entityManager.getEntitiesByTag('projectile');
        // Calculate all NPC tile / player cols.
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            npc.getComponent(CState).grounded = false;
            if (!npc.hasComponent(CBoundingBox)) {
                continue;
            }
            this.handleRectangularCollisions(this.player, npc);
            for (let j = 0; j < tiles.length; j++) {
                this.handleRectangularCollisions(npc, tiles[j]);
            }

            for (let j = 0; j < projectiles.length; j++) {
                let projectile = projectiles[j];
                if (projectile.getComponent(CProjectile).friendly) {
                    let overlap = Physics.getOverlap(projectile, npc);
                    if (overlap.x > 0.0 && overlap.y >= 0.0) {
                        npc.getComponent(CState).state = 'hurt';
                        npc.getComponent(CHealth).health -= projectile.getComponent(CProjectile).damage;
                        let explode  = this.entityManager.addEntity("effect");
                        explode.addComponent(new CTransform(npc.getComponent(CTransform).pos));
                        explode.addComponent(new CAnimation("explode", false));
                        this.game.playSound("explode");
                        projectile.destroy();
                    }
                }
            }
        }

        // Calculate all tile / projectile collisions.
        for (let i = 0; i < projectiles.length; i++) {
            let projectile = projectiles[i];

            for (let j = 0; j < tiles.length; j++) {
                let tile = tiles[j];
                let overlap = Physics.getOverlap(projectile, tile);
                if (overlap.x > 0.0 && overlap.y >= 0.0) {
                    projectile.destroy();
                }
            }

            // Also, incur damage if a projectile collides with the player if not friendly.
            if (!projectile.getComponent(CProjectile).friendly) {
                let overlap = Physics.getOverlap(projectile, this.player);
                if (overlap.x > 0.0 && overlap.y >= 0.0) {
                    this.player.getComponent(CState).state = 'hurt';
                    this.player.getComponent(CHealth).health -= projectile.getComponent(CProjectile).damage;
                    projectile.destroy();
                }
            }
        }

        // Calculate all player tiles cols.
        this.player.getComponent(CState).grounded = false;
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];
            if (!tile.getComponent(CBoundingBox).blockMove) {
                continue;
            }
            this.handleRectangularCollisions(this.player, tile);
        }

        let objectiveOverlap = Physics.getOverlap(this.player, this.levelObjective);
        if (objectiveOverlap.x > 0 && objectiveOverlap.y > 0) {
            this.game.setScore(this.score, this.level.name);
            this.game.setNextLevel(this.level.name);
            this.gameOver = true;
            this.game.drawText("Victory!", 'go','68px Seagram', '#00FF00', 375,  250);
            this.game.drawText("Press ESC to leave or R to retry...", 'got','20px Seagram', '#00FF00', 360,  370);
        }
    }

    sHealth() {
        let health = this.player.getComponent(CHealth).health;
        let mp = this.player.getComponent(CMagic).mp;
        if (health <= 0) {
            this.player.getComponent(CState).state = 'dying';
        }

        if (this.currentHP !== health) {
            this.currentHP = health;
            this.game.drawText("Health: " + this.currentHP  , 'hp','16px PS2P', '#FF0909', 20, 22);
        }

        if (this.currentMP != mp) {
            this.currentMP = mp;
            this.game.drawText("MP: " + this.currentMP  , 'mp','16px PS2P', '#0D09E3', 20, 44);
        }

        if (this.score != this.prevScore) {
            this.game.drawText("Score: " + this.score  , 's','16px PS2P', '#00FF00', 800, 20);
            this.prevScore = this.score;
        }

        let npcs = this.entityManager.getEntitiesByTag("npc");
        for (let i = 0; i < npcs.length; i++) {
            let npc = npcs[i];
            if (npc.getComponent(CHealth).health <= 0) {
                npc.getComponent(CState).state = 'dying';
            }
        }

    }

    sMagic() {
        let magic = this.player.getComponent(CMagic);
        if (magic.clock.elapsedTime > magic.cooldown) {
            magic.clock.stop();
            magic.clock.elapsedTime = 0;
            magic.canMagic = true;
        }
    }

    sLifespan() {
        let projectiles = this.entityManager.getEntitiesByTag("projectile");
        for (let i = 0; i < projectiles.length; i++) {
            let projectile = projectiles[i]
            let lifeSpan = projectile.getComponent(CLifespan).duration;
            let clock = projectile.getComponent(CLifespan).clock;
            if (clock.elapsedTime > lifeSpan) {
                projectile.destroy();
            }
        }
    }
}

module.exports = GameState_Play;
