import Sprite from './Sprite.js';

let filePath = "No File Path";
let spriteCount = 0;
let spitresLoaded = 0;
const spriteMap = new Map();
// let m_SoundCount = 0;
// let m_SoundsLoaded = 0;
// let m_SoundMap = new Map();


// Load the asstets from a given file name. (Assets.json)
export function loadFromFile(fileName) {
    filePath = fileName;

    // Load a JSON then parse the content once it's loaded.
    loadJSON(function(response) {
        // Parse the loaded file.
        let content = JSON.parse(response);

        for (let i = 0; i < content.length; i++) {
            if (content[i].Type === 'Sprite') {
                setSprite(content[i].SpriteName, content[i].ImageSource, content[i].FrameCount);
            }
            else if (content[i].Type === 'Sound') {
                // Set Sound.
            }
            else if (content[i].Type === 'Font') {
                // Set Font.
            }
            else {
                console.log("Badly fromatted Assets file : ", content[i]);
            };

        }
    });
}

// Set a sprtie object, added to the Spirte map. 
export function setSprite(spriteName, imgSrc, frameCount) {
    spriteCount++;
    let sprite = new Sprite(spriteName, imgSrc, frameCount);
    spriteMap.set(spriteName, sprite);
}

// Call to get a copy of a sprite.
export function getSprite(spriteName) {
    return spriteMap.get(spriteName);
}

// Call when the image for a spirte is fully loaded.
export function spriteLoaded() {
    spitresLoaded++;
}

// The function which reports if all the sprites are currently loaded. 
export function allSpritesLoaded() {
    if (spriteCount == spitresLoaded && spriteCount != 0) {
        return true;
    }
    return false;
}

// LOAD the JSON through a XML request.
function loadJSON(callback) {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}


// export function all_Sounds_Loaded() {
//     if (m_SoundsLoaded == m_SoundCount){return true;}
//     else {return false;}
// }

// export function get_Sound(sound_name) {
//     return m_SoundMap.get(sound_name);
// }

// export function set_Sound(sound_name, sound_source) {
//     m_SoundCount++;
//     let sound = new Audio();
//     sound.onload = function() {
//         console.log(sound_name + ' Loaded');
//          m_SoundMap.set(sound_name, sound);
//          m_SoundsLoaded++;
//     }
//     sound.src = sound_source;
// }