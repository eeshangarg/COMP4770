// @flow
/* global module */
/* global require */

const Vec = require('./Vec.js');

const MAX_COMPONENTS = 32;

// Think of this as an abstract base class
class Component {}

class CTransform extends Component {
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

class CInput extends Component {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    shoot: boolean;
    canShoot: boolean;

    constructor() {
        super();
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shoot = false;
        this.canShoot = true;
    }
}

class CBoundingBox extends Component {
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

class CGravity extends Component {
    gravity: number;

    constructor(g: number) {
        super();
        this.gravity = g;
    }
}

class CHealth extends Component {
    health: number;

    constructor() {
        super();
        this.health = 100;
    }
}

class CState extends Component {
    state: string;

    constructor(s: string) {
        super();
        this.state = s;
    }
}

class CDraggable extends Component {
    isBeingDragged: boolean;
    animationIndex: number;

    constructor() {
        super();
        this.isBeingDragged = false;
        this.animationIndex = 0;
    }
}

class CFollow extends Component {
    home: Vec;
    speed: number;

    constructor(h: Vec, s: number) {
        super();
        this.home = h;
        this.speed = s;
    }
}

class CPatrol extends Component {
    positions: Array<number>;
    currentPosition: number;
    speed: number;

    constructor(p: Array<number>, s: number) {
        super();
        this.positions = p;
        this.speed = s;
    }
}

module.exports = {
    'CTransform': CTransform,
    'CInput': CInput,
    'CBoundingBox': CBoundingBox,
    'CGravity': CGravity,
    'CHealth': CHealth,
    'CState': CState,
    'CDraggable': CDraggable,
    'CFollow': CFollow,
    'CPatrol': CPatrol,
    'MAX_COMPONENTS': MAX_COMPONENTS
};
