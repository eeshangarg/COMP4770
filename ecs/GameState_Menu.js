// @flow
/* istanbul ignore file */
/* global module */
/* global require */
// flowlint unclear-type:off

const GameState = require('./GameState.js');
const GameEngine = require('./GameEngine.js');
const Vec = require('./Vec.js');

class GameState_Menu extends GameState {
    game: GameEngine;
    title: string;
    selectedMenuIndex: number;
    selectedSPIndex: number;
    selectedLEIndex: number;
    selectedCLIndex: number;
    menuItems: number;
    menuStrings: Array<string>;
    spLevels: Array<Object>;
    customLevels: Array<Object>;
    spLevelMode: boolean;
    levelEditorMode: boolean;
    customLevelMode: boolean;
    mainMenuMode: boolean;

    constructor(game: GameEngine) {
        super();
        this.game = game;
        this.title = "The Knight Before";
        this.selectedMenuIndex = 0;
        this.selectedLEIndex = 0;
        this.selectedSPIndex = 0;
        this.selectedCLIndex = 0;
        this.spLevelMode = false;
        this.customLevelMode = false;
        this.levelEditorMode = false;
        this.mainMenuMode = true;
        this.menuStrings = [];
        this.customLevels = [];
        this.init();
    }

    init() {
        this.menuStrings = [];
        this.customLevels = [];
        this.game.drawFrame(new Vec(0, 0));
        this.menuStrings.push('Single Player');
        this.menuStrings.push('Level Editor');
        this.menuStrings.push('Custom Levels');
        this.menuStrings.push('Items');
        this.menuStrings.push('Settings');
        this.game.setBackground('bg_menu');
        this.selectedMenuIndex = 0;
        this.selectedLEIndex = 0;
        this.selectedSPIndex = 0;
        this.selectedCLIndex = 0;
        this.spLevelMode = false;
        this.levelEditorMode = false;
        this.customLevelMode = false;
        this.mainMenuMode = true;
        this.menuItems = this.menuStrings.length;
        this.spLevels = this.game.spLevels;
        this.drawMenuStrings();
    }

    update() {
        if (this.mainMenuMode) {
            this.menu();
        } else if (this.spLevelMode) {
            this.singlePlayer();
        } else if (this.levelEditorMode) {
            this.levelEditor();
        } else if (this.customLevelMode) {
            this.customLevel();
        }
    }


    menu() {

        let inputMap = this.game.getInputMap();
        if (inputMap.s && !inputMap.w) {
            inputMap.s = 0;
            this.selectedMenuIndex++;
            if (this.selectedMenuIndex >= this.menuItems) {
                this.selectedMenuIndex = 0;
            }
            this.drawMenuStrings();
        } else if (inputMap.w) {
            inputMap.w = 0;
            this.selectedMenuIndex--;
            if (this.selectedMenuIndex < 0) {
                this.selectedMenuIndex = this.menuItems - 1;
            }
            this.drawMenuStrings();
        }

        if (inputMap.enter && this.selectedMenuIndex === 0) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.spLevelMode = true;
            this.mainMenuMode = false;
            this.drawSPlevels();
        } else if (inputMap.enter && this.selectedMenuIndex === 1) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.levelEditorMode = true;
            this.mainMenuMode = false;
            this.drawLevelEditor();
        } else if (inputMap.enter && this.selectedMenuIndex === 2) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.customLevelMode = true;
            this.mainMenuMode = false;
            this.drawCustomLevels();
        }
    }

    singlePlayer() {
        let inputMap = this.game.getInputMap();
        if (inputMap.escape) {
            inputMap.escape = 0;
            this.spLevelMode = false;
            this.mainMenuMode = true;
            this.drawMenuStrings();
        }
        if (inputMap.enter) {
            inputMap.enter = 0;
            this.spLevelMode = false;
            this.mainMenuMode = true;
            this.game.pushState('single player', this.selectedSPIndex);
            this.game.clearText('all');
        }
        if (inputMap.s && !inputMap.w) {
            inputMap.s = 0;
            this.selectedSPIndex++;
            if (this.selectedSPIndex >= 5) {
                this.selectedSPIndex = 0;
            }
            this.drawSPlevels();
        } else if (inputMap.w) {
            inputMap.w = 0;
            this.selectedSPIndex--;
            if (this.selectedSPIndex < 0) {
                this.selectedSPIndex = 4;
            }
            this.drawSPlevels();
        }

    }

    levelEditor() {
            let inputMap = this.game.getInputMap();
            if (inputMap.escape) {
                inputMap.escape = 0;
                this.levelEditorMode = false;
                this.mainMenuMode = true;
                this.drawMenuStrings();
            }
            if (inputMap.enter) {
                inputMap.enter = 0;
                this.game.pushState('level editor', this.selectedLEIndex);
                this.game.clearText('all');
            }
            if (inputMap.s && !inputMap.w) {
                inputMap.s = 0;
                this.selectedLEIndex++;
                if (this.selectedLEIndex >= 5) {
                    this.selectedLEIndex = 0;
                }
                this.drawLevelEditor();
            } else if (inputMap.w) {
                inputMap.w = 0;
                this.selectedLEIndex--;
                if (this.selectedLEIndex < 0) {
                    this.selectedLEIndex = 4;
                }
                this.drawLevelEditor();
            }
    }

    customLevel() {
        let inputMap = this.game.getInputMap();
        if (inputMap.escape) {
            inputMap.escape = 0;
            this.customLevelMode = false;
            this.mainMenuMode = true;
            this.drawMenuStrings();
        }

        if (inputMap.enter) {


        }

        if (inputMap.s && !inputMap.w) {
            inputMap.s = 0;
            this.selectedCLIndex++;
            if (this.selectedCLIndex >= 5) {
                this.selectedCLIndex = 0;
            }
            this.drawCustomLevels();
        } else if (inputMap.w) {
            inputMap.w = 0;
            this.selectedCLIndex--;
            if (this.selectedCLIndex < 0) {
                this.selectedCLIndex = 4;
            }
            this.drawCustomLevels();
        }
    }


    // $FlowFixMe
    drawLevelEditor() {
        let self = this;
        this.game.drawText(this.title, 'title', '60px Seagram', '#F5F5F5', 305, 135);
        // $FlowFixMe
        let callback = this.game.getCustomLevels(function(customLevels, game) {
            for (let i = 0; i < customLevels.length; i++) {
                self.game.drawText(customLevels[i].name, i.toString(), '20px PS2P', '#FDFEFE', 400, 235 + i * 48);
            }
            let i = self.selectedLEIndex;
            self.game.drawText('Edit: ' + customLevels[i].name, i.toString(), '20px PS2P', '#FFFF00', 400, 235 + i * 48);
        });
    }

    // $FlowFixMe
    drawCustomLevels() {
        let self = this;
        this.game.drawText(this.title, 'title', '60px Seagram', '#F5F5F5', 305, 135);
        // $FlowFixMe
        let callback = this.game.getCustomLevels(function(customLevels, game) {
            for (let i = 0; i < customLevels.length; i++) {
                self.game.drawText(customLevels[i].name, i.toString(), '20px PS2P', '#FDFEFE', 400, 235 + i * 48);
            }
            let i = self.selectedCLIndex;
            self.game.drawText('Play: ' + customLevels[i].name, i.toString(), '20px PS2P', '#FFFF00', 400, 235 + i * 48);
        });
    }

    drawSPlevels() {
        this.game.drawText(this.title, 'title', '60px Seagram', '#F5F5F5', 305, 135);
        for (let i = 0; i < this.spLevels.length; i++) {
            this.game.drawText(this.spLevels[i].name, i.toString(), '20px PS2P', '#FDFEFE', 400, 235 + i * 48);
        }
        let i = this.selectedSPIndex;
        this.game.drawText('Play: ' + this.spLevels[i].name, i.toString(), '20px PS2P', '#FFFF00', 400, 235 + i * 48);
    }

    drawMenuStrings() {
        this.game.drawText(this.title, 'title', '60px Seagram', '#F5F5F5', 305, 135);
        for (let i = 0; i < this.menuStrings.length; i++) {
            this.game.drawText(this.menuStrings[i], i.toString(), '20px PS2P', '#FDFEFE', 400, 235 + i * 48);
        }
        let i = this.selectedMenuIndex;
        this.game.drawText(this.menuStrings[i], i.toString(), '20px PS2P', '#FFFF00', 400, 235 + i * 48);
    }

}

module.exports = GameState_Menu;