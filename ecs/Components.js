// @flow
/* global module */
/* global require */

const Vec = require('./Vec.js');
const Animation = require('./../rendering/Animation.js');
const getAnimation = require('./../rendering/Rendering.js').getAnimation;
const MAX_COMPONENTS = 20;

// Think of this as an abstract base class
class Component {
    static INDEX: number;
}
// The value of INDEX is useless here.
Component.INDEX = Infinity;

class CTransform extends Component {
    static INDEX: number;

    pos: Vec;
    prevPos: Vec;
    scale: Vec;
    speed: Vec;
    angle: number;

    constructor(p: Vec) {
        super();
        this.pos = p;
        this.prevPos = new Vec(0.0, 0.0);
        this.scale = new Vec(1.0, 1.0);
        this.speed = new Vec(0.0, 0.0);
        this.angle = 0.0;
    }
}
CTransform.INDEX = 0;

class CInput extends Component {
    static INDEX: number;

    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    shoot: boolean;
    canShoot: boolean;
    mousePos: Vec;

    constructor() {
        super();
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shoot = false;
        this.canShoot = true;
        this.mousePos = new Vec(0,0);
    }
}
CInput.INDEX = 1;

class CBoundingBox extends Component {
    static INDEX: number;

    size: Vec;
    halfSize: Vec;
    blockMove: boolean;
    blockVision: boolean;

    constructor(s: Vec, m: boolean, v: boolean) {
        super();
        this.size = s;
        this.halfSize = new Vec(this.size.x / 2, this.size.y / 2);
        this.blockMove = m;
        this.blockVision = v;
    }
}
CBoundingBox.INDEX = 2;

class CGravity extends Component {
    static INDEX: number;

    gravity: number;

    constructor(g: number) {
        super();
        this.gravity = g;
    }
}
CGravity.INDEX = 3;

class CHealth extends Component {
    static INDEX: number;

    health: number;

    constructor() {
        super();
        this.health = 100;
    }
}
CHealth.INDEX = 4;

class CState extends Component {
    static INDEX: number;

    state: string;

    constructor(s: string) {
        super();
        this.state = s;
    }
}
CState.INDEX = 5;

class CDraggable extends Component {
    static INDEX: number;

    isBeingDragged: boolean;
    animationIndex: number;

    constructor() {
        super();
        this.isBeingDragged = false;
        this.animationIndex = 0;
    }
}
CDraggable.INDEX = 6;

class CFollow extends Component {
    static INDEX: number;

    home: Vec;
    speed: number;

    constructor(h: Vec, s: number) {
        super();
        this.home = h;
        this.speed = s;
    }
}
CFollow.INDEX = 7;

class CPatrol extends Component {
    static INDEX: number;

    positions: Array<number>;
    currentPosition: number;
    speed: number;

    constructor(p: Array<number>, s: number) {
        super();
        this.positions = p;
        this.speed = s;
    }
}
CPatrol.INDEX = 8;

class CAnimation extends Component {
    static INDEX: number;

    animation: Animation;
    repeated: boolean;

    constructor(n: string, r: boolean) {
        super();
        this.animation = getAnimation(n);
        this.repeated = r;
    }
}
CAnimation.INDEX = 9;




module.exports = {
    'Component': Component,
    'CTransform': CTransform,
    'CInput': CInput,
    'CBoundingBox': CBoundingBox,
    'CGravity': CGravity,
    'CHealth': CHealth,
    'CState': CState,
    'CDraggable': CDraggable,
    'CFollow': CFollow,
    'CPatrol': CPatrol,
    'CAnimation': CAnimation,
    'MAX_COMPONENTS': MAX_COMPONENTS
};
