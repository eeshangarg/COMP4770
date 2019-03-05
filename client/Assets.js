import Sprite from './Sprite.js';

let filePath = "No File Path";
let m_SpriteCount = 0;
let m_SpitresLoaded = 0;
const m_SpriteMap = new Map();
// let m_SoundCount = 0;
// let m_SoundsLoaded = 0;
// let m_SoundMap = new Map();


// Load the asstets from a given file name. (Assets.json)
export function load_from_file(fileName) {
    filePath = fileName;

    // Load a JSON then parse the content once it's loaded.
    loadJSON(function(response) {
        // Parse the loaded file.
        let content = JSON.parse(response);

        for (let i = 0; i < content.length; i++) {
            if (content[i].Type === 'Sprite') {
                set_Sprite(content[i].SpriteName, content[i].ImageSource, content[i].FrameCOunt);
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
export function set_Sprite(spriteName, imgSrc, frameCount) {
    m_SpriteCount++;
    let sprite = new Sprite(spriteName, imgSrc, frameCount);
    m_SpriteMap.set(spriteName, sprite);
}

// Call to get a copy of a sprite.
export function get_Sprite(spriteName) {
    return m_SpriteMap.get(spriteName);
}

// Call when the image for a spirte is fully loaded.
export function sprite_Loaded() {
    m_SpitresLoaded++;
}

// The function which reports if all the sprites are currently loaded. 
export function all_Sprite_Loaded() {
    if (m_SpriteCount == m_SpitresLoaded && m_SpriteCount != 0) {
        return true;
    }
    return false;
}

// LOAD the JSON through a XML request.
function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
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