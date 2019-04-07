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
    levelsCompleted: number;
    menuItems: number;
    selectedCheatIndex: number;
    selectedSettingsIndex: number;
    menuStrings: Array<string>;
    spLevels: Array<Object>;
    customLevels: Array<Object>;
    spLevelMode: boolean;
    levelEditorMode: boolean;
    customLevelMode: boolean;
    settingsMode: boolean;
    cheatsMode: boolean;
    storyMode: boolean;
    mainMenuMode: boolean;

    constructor(game: GameEngine) {
        super();
        this.game = game;
        this.title = "The Knight Before";
        this.selectedMenuIndex = 0;
        this.selectedLEIndex = 0;
        this.selectedSPIndex = 0;
        this.selectedCLIndex = 0;
        this.selectedCheatIndex = 0;
        this.selectedSettingsIndex = 0;
        this.spLevelMode = false;
        this.customLevelMode = false;
        this.levelEditorMode = false;
        this.storyMode = false;
        this.settingsMode = false;
        this.cheatsMode = false;
        this.mainMenuMode = true;
        this.menuStrings = [];
        this.customLevels = [];
        this.init();
    }

    init() {
        this.game.clearText('all');
        this.menuStrings = [];
        this.customLevels = [];
        this.game.drawFrame(new Vec(0, 0));
        this.menuStrings.push('Single Player');
        this.menuStrings.push('Level Editor');
        this.menuStrings.push('Custom Levels');
        this.menuStrings.push('Cheats');
        this.menuStrings.push('Story');
        this.menuStrings.push('Settings');
        this.game.setBackground('bg_menu');
        this.selectedMenuIndex = 0;
        this.selectedLEIndex = 0;
        this.selectedSPIndex = 0;
        this.selectedCLIndex = 0;
        this.levelsCompleted = 1;
        this.spLevelMode = false;
        this.levelEditorMode = false;
        this.customLevelMode = false;
        this.levelEditorMode = false;
        this.storyMode = false;
        this.settingsMode = false;
        this.cheatsMode = false;
        this.mainMenuMode = true;
        this.menuItems = this.menuStrings.length;
        this.spLevels = this.game.spLevels;
        this.drawMenuStrings();
    }

    update() {
        if (this.mainMenuMode) {
            this.menu();
        }
        else if (this.spLevelMode) {
            this.singlePlayer();
        }
        else if (this.levelEditorMode) {
            this.levelEditor();
        }
        else if (this.customLevelMode) {
            this.customLevel();
        }
        else if (this.storyMode) {
            this.story();
        }
        else if (this.cheatsMode) {
            this.cheats();
        }
        else if (this.settingsMode) {
            this.settings();
        }
    }


    menu() {

        let inputMap = this.game.getInputMap();
        if (inputMap.s && !inputMap.w) {
            this.game.playSound('coin');
            inputMap.s = 0;
            this.selectedMenuIndex++;
            if (this.selectedMenuIndex >= this.menuItems) {
                this.selectedMenuIndex = 0;
            }
            this.drawMenuStrings();
        } else if (inputMap.w) {
            this.game.playSound('coin');

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
        }
        else if (inputMap.enter && this.selectedMenuIndex === 1) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.levelEditorMode = true;
            this.mainMenuMode = false;
            this.drawLevelEditor();
        }
        else if (inputMap.enter && this.selectedMenuIndex === 2) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.customLevelMode = true;
            this.mainMenuMode = false;
            this.drawCustomLevels();
        }
        else if (inputMap.enter && this.selectedMenuIndex === 3) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.cheatsMode = true;
            this.mainMenuMode = false;
            this.drawCheatsStrings();
        }
        else if (inputMap.enter && this.selectedMenuIndex === 4) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.storyMode = true;
            this.mainMenuMode = false;
            this.drawStoryString();
        }
        else if (inputMap.enter && this.selectedMenuIndex === 5) {
            this.game.clearText('all');
            inputMap.enter = 0;
            this.settingsMode = true;
            this.mainMenuMode = false;
            this.drawSettingsStrings();
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
            this.game.clearText('all');
            inputMap.enter = 0;
            this.spLevelMode = false;
            this.mainMenuMode = true;
            this.game.pushState('single player', this.selectedSPIndex);
            this.game.stopSound('menu');
        }
        if (inputMap.s && !inputMap.w) {
            this.game.playSound('coin');
            inputMap.s = 0;
            this.selectedSPIndex++;
            if (this.selectedSPIndex > this.levelsCompleted) {
                this.selectedSPIndex = 0;
            }
            this.drawSPlevels();
        } else if (inputMap.w) {
            this.game.playSound('coin');
            inputMap.w = 0;
            this.selectedSPIndex--;
            if (this.selectedSPIndex < 0) {
                this.selectedSPIndex = this.levelsCompleted;
            }
            this.drawSPlevels();
        }

    }

    levelEditor() {
            let inputMap = this.game.getInputMap();
            if (inputMap.escape) {
                this.game.clearText('all');
                inputMap.escape = 0;
                this.levelEditorMode = false;
                this.mainMenuMode = true;
                this.drawMenuStrings();
            }
            if (inputMap.enter) {
                inputMap.enter = 0;
                this.game.pushState('level editor', this.selectedLEIndex);
                this.game.clearText('all');
                this.game.stopSound('menu');
            }
            if (inputMap.s && !inputMap.w) {
                this.game.playSound('coin');
                inputMap.s = 0;
                this.selectedLEIndex++;
                if (this.selectedLEIndex >= 10) {
                    this.selectedLEIndex = 0;
                }
                this.drawLevelEditor();
            }
            else if (inputMap.w) {
                this.game.playSound('coin');
                inputMap.w = 0;
                this.selectedLEIndex--;
                if (this.selectedLEIndex < 0) {
                    this.selectedLEIndex = 9;
                }
                this.drawLevelEditor();
            }
    }

    customLevel() {

        let inputMap = this.game.getInputMap();
        if (inputMap.escape) {
            this.game.clearText('all');
            inputMap.escape = 0;
            this.customLevelMode = false;
            this.mainMenuMode = true;
            this.drawMenuStrings();
        }

        if (inputMap.enter) {
                inputMap.enter = 0;
                this.game.pushState('custom level', this.selectedCLIndex);
                this.game.clearText('all');
                this.game.stopSound('menu');
        }

        if (inputMap.s && !inputMap.w) {
            this.game.playSound('coin');
            inputMap.s = 0;
            this.selectedCLIndex++;
            if (this.selectedCLIndex >= 10) {
                this.selectedCLIndex = 0;
            }
            this.drawCustomLevels();
        }
        else if (inputMap.w) {
            this.game.playSound('coin');
            inputMap.w = 0;
            this.selectedCLIndex--;
            if (this.selectedCLIndex < 0) {
                this.selectedCLIndex = 9;
            }
            this.drawCustomLevels();
        }
    }

    story() {
        let inputMap = this.game.getInputMap();
        if (inputMap.escape) {
            inputMap.escape = 0;
            this.storyMode = false;
            this.mainMenuMode = true;
            this.game.setBackground("bg_menu");
            this.drawMenuStrings();
        }

    }

    cheats() {
        let inputMap = this.game.getInputMap();
        let cheats = Object.keys(this.game.cheats);
        if (inputMap.escape) {
            this.game.clearText('all');
            inputMap.escape = 0;
            this.cheatsMode = false;
            this.mainMenuMode = true;
            this.drawMenuStrings();
        }

        if (inputMap.enter) {
            this.game.playSound('coin');
            inputMap.enter = 0;
            let cheat = cheats[this.selectedCheatIndex];
            this.game.cheats[cheat] = !this.game.cheats[cheat];
            this.drawCheatsStrings();
        }

        if (inputMap.s && !inputMap.w) {
            this.game.playSound('coin');
            inputMap.s = 0;
            this.selectedCheatIndex++;
            if (this.selectedCheatIndex >= cheats.length) {
                this.selectedCheatIndex = 0;
            }
            this.drawCheatsStrings();
        } else if (inputMap.w) {
            this.game.playSound('coin');
            inputMap.w = 0;
            this.selectedCheatIndex--;
            if (this.selectedCheatIndex < 0) {
                this.selectedCheatIndex = cheats.length - 1;
            }
            this.drawCheatsStrings();
        }
    }


    settings() {
        let inputMap = this.game.getInputMap();
        if (inputMap.escape) {
            inputMap.escape = 0;
            this.settingsMode = false;
            this.mainMenuMode = true;
            this.game.clearText('all');
            this.drawMenuStrings();
        }

        if (inputMap.s && !inputMap.w) {
            this.game.playSound('coin');
            inputMap.s = 0;
            this.selectedSettingsIndex++;
            if (this.selectedSettingsIndex > 1) {
                this.selectedSettingsIndex = 0;
            }
            this.drawSettingsStrings();
        }
        else if (inputMap.w) {
            this.game.playSound('coin');
            inputMap.w = 0;
            this.selectedSettingsIndex--;
            if (this.selectedSettingsIndex < 0) {
                this.selectedSettingsIndex = 1;
            }
            this.drawSettingsStrings();
        }
        else if (inputMap.enter) {
            this.game.playSound('coin');
            inputMap.enter = 0;
            if (this.selectedSettingsIndex === 0) {
                this.game.soundOn = !this.game.soundOn;
                if (!this.game.soundOn) {
                    this.game.stopSound("menu");
                    this.game.muteMusic();
                }
                else {
                    this.game.muteMusic();
                    this.game.playSound("menu");
                }
                this.drawSettingsStrings();
            }
            else if (this.selectedSettingsIndex === 1) {
                if (this.game.diff === 0.5) {
                    this.game.diff = 1;
                }
                else if (this.game.diff === 1) {
                    this.game.diff = 1.5;
                }
                else if (this.game.diff === 1.5) {
                    this.game.diff = 0.5;
                }
                this.drawSettingsStrings();
            }
        }
    }



    drawCheatsStrings() {
        let cheats = Object.keys(this.game.cheats);
        this.game.drawText(this.title, 'title', '68px Seagram', '#FDFEFE', 255, 135);
        for (let i = 0; i < cheats.length; i++) {
            if (this.game.cheats[cheats[i]]) {
                this.game.drawText(cheats[i]+ ": ON", i.toString(), '20px PS2P', '#3CFF00', 400, 235 + i * 48);
            }
            else {
                this.game.drawText(cheats[i] + ": OFF", i.toString(), '20px PS2P', '#FF0000', 400, 235 + i * 48);
            }
            
        }
        let i = this.selectedCheatIndex;
        if (this.game.cheats[cheats[i]]) {
            this.game.drawText('Toggle: ' + cheats[i] + ": ON", i.toString(), '20px PS2P', '#3CFF00', 235, 235 +  i * 48);
        }
        else {
            this.game.drawText('Toggle: ' + cheats[i] + ": OFF", i.toString(), '20px PS2P', '#FF0000', 235, 235 +  i * 48);
        }
        
    }

    drawStoryString() {
        this.game.setBackground("bg_story");
    }

    drawSettingsStrings(){



        this.game.drawText(this.title, 'title', '68px Seagram', '#FDFEFE', 255, 135);

        if (this.selectedSettingsIndex == 0) {
            this.game.drawText("Toggle:",  'i', '20px PS2P', '#FFFF00', 210, 250);
        }
        else if (this.selectedSettingsIndex === 1) {
            this.game.drawText("Cycle:",  'i', '20px PS2P', '#FFFF00', 220, 325);
        }

        if (this.game.soundOn) {
            this.game.drawText("Sound:ON",  's', '20px PS2P', '#3CFF00', 350, 250);
        }
        else {
            this.game.drawText("Sound:OFF",  's', '20px PS2P', '#FF0000', 350, 250);
        }


        if (this.game.diff === 0.5) {
            this.game.drawText("Difficulty:Easy",  'd', '20px PS2P', '#FDFEFE', 350, 325);
        }
        else if (this.game.diff === 1) {
            this.game.drawText("Difficulty:Normal",  'd', '20px PS2P', '#FDFEFE', 350, 325);
        }
        else if (this.game.diff === 1.5) {
            this.game.drawText("Difficulty:Hard",  'd', '20px PS2P', '#FDFEFE', 350, 325);
        }

    }

    // $FlowFixMe
    drawLevelEditor() {
        let self = this;
        this.game.drawText(this.title, 'title', '68px Seagram', '#FDFEFE', 255, 135);
        // $FlowFixMe
        let callback = this.game.getCustomLevels(function(customLevels, game) {
            for (let i = 0; i < customLevels.length; i++) {
                self.game.drawText(customLevels[i].name, i.toString(), '20px PS2P', '#FDFEFE', 400, 200 + i * 34);
            }
            let i = self.selectedLEIndex;
            self.game.drawText('Edit: ' + customLevels[i].name, i.toString(), '20px PS2P', '#FFFF00', 278, 200+ i * 34);
        });
    }

    // $FlowFixMe
    drawCustomLevels() {
        let self = this;
        this.game.drawText(this.title, 'title', '68px Seagram', '#FDFEFE', 255, 135);
        // $FlowFixMe
        let callback = this.game.getCustomLevels(function(customLevels, game) {
            for (let i = 0; i < customLevels.length; i++) {
                self.game.drawText(customLevels[i].name, i.toString(), '20px PS2P', '#FDFEFE', 400, 200 + i * 34);
            }
            let i = self.selectedCLIndex;
            self.game.drawText('Play: ' + customLevels[i].name, i.toString(), '20px PS2P', '#FFFF00', 278, 200 + i * 34);
        });
    }

    drawSPlevels() {
        let self = this;
        this.game.drawText(self.title, 'title', '68px Seagram', '#FDFEFE', 255, 135);
        let callback = this.game.getProgress(function(progress) {
            self.levelsCompleted = progress.levelCompleted;
            
            for (let i = 0; i < self.spLevels.length; i++) {
                if (i <= progress.levelCompleted){
                    self.game.drawText(self.spLevels[i].name + " score: " + progress.score[i], i.toString(), '20px PS2P', '#FDFEFE', 400, 235 + i * 48);
                }
                else {
                    self.game.drawText('Locked: ' + self.spLevels[i].name, i.toString(), '20px PS2P', '#AFAFAF', 400, 235 + i * 48);
                }
                
            }

            let i = self.selectedSPIndex;
            self.game.drawText('Play: ' + self.spLevels[i].name  +  " score: "  + progress.score[i], i.toString(), '20px PS2P', '#FFFF00', 278, 235 + i * 48);

        });

    }

    drawMenuStrings() {
        this.game.drawText(this.title, 'title', '68px Seagram', '#FDFEFE', 255, 135);
        for (let i = 0; i < this.menuStrings.length; i++) {
            this.game.drawText(this.menuStrings[i], i.toString(), '20px PS2P', '#FDFEFE', 400, 235 + i * 48);
        }
        let i = this.selectedMenuIndex;
        this.game.drawText(this.menuStrings[i], i.toString(), '20px PS2P', '#FFFF00', 400, 235 + i * 48);
    }

}

module.exports = GameState_Menu;
