import Sprite from './Sprite.js';

let m_SpriteCount = 0;
let m_SpitresLoaded = 0;
const m_SpriteMap = new Map();
let filePath = "No File Path";
// let m_SoundCount = 0;
// let m_SoundsLoaded = 0;
// let m_SoundMap = new Map();


export function load_from_file(fileName) {
    filePath = fileName;
    loadJSON(function(response) {
        let content = JSON.parse(response);
        for (let i = 0; i < content.length; i++) {
            set_Sprite(content[i].SpriteName, content[i].ImageSource, content[i].FrameCOunt);
        }
    });
}

export function set_Sprite(spriteName, imgSrc, frameCount) {
    m_SpriteCount++;
    let sprite = new Sprite(spriteName, imgSrc, frameCount);
    m_SpriteMap.set(spriteName, sprite);
}

export function get_Sprite(spriteName) {
    return m_SpriteMap.get(spriteName);
}


export function sprite_Loaded() {
    m_SpitresLoaded++;
}

export function all_Sprite_Loaded() {
    if (m_SpriteCount == m_SpitresLoaded){return true;}
    return false;
}

function loadJSON(callback) { 
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', filePath, true);
    xobj.onreadystatechange = function () {
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