// @flow
/* global module */
/* global require */

const Vec = require('./Vec.js');
const Entity = require('./Entity.js');
const Components = require('./Components.js');
const CTransform = Components.CTransform;
const CBoundingBox = Components.CBoundingBox;


function getOverlap(a: Entity, b: Entity): Vec {
    let x1: number = a.getComponent(CTransform).pos.x;
    let y1: number = a.getComponent(CTransform).pos.y;
    let x2: number = b.getComponent(CTransform).pos.x;
    let y2: number = b.getComponent(CTransform).pos.y;
    let delta: Vec = new Vec(Math.abs(x1-x2), Math.abs(y1-y2));
    let w1: number = a.getComponent(CBoundingBox).halfSize.x;
    let h1: number = a.getComponent(CBoundingBox).halfSize.y;
    let w2: number = b.getComponent(CBoundingBox).halfSize.x;
    let h2: number = b.getComponent(CBoundingBox).halfSize.y;
    let ox: number = w1 + w2 - delta.x;
    let oy: number = h1 + h2 - delta.y;
    return new Vec(ox, oy);
}

function getPreviousOverlap(a: Entity, b: Entity): Vec {
    let x1: number = a.getComponent(CTransform).prevPos.x;
    let y1: number = a.getComponent(CTransform).prevPos.y;
    let x2: number = b.getComponent(CTransform).prevPos.x;
    let y2: number = b.getComponent(CTransform).prevPos.y;
    let delta: Vec = new Vec(Math.abs(x1-x2), Math.abs(y1-y2));
    let w1: number = a.getComponent(CBoundingBox).halfSize.x;
    let h1: number = a.getComponent(CBoundingBox).halfSize.y;
    let w2: number = b.getComponent(CBoundingBox).halfSize.x;
    let h2: number = b.getComponent(CBoundingBox).halfSize.y;
    let ox: number = w1 + w2 - delta.x;
    let oy: number = h1 + h2 - delta.y;
    return new Vec(ox, oy);
}

function lineIntersect(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
    var r: Vec = b.subtract(a);
    var s: Vec = d.subtract(c);
    var rxs: number = r.cross(s);
    var cma: Vec = c.subtract(a);
    var t: number = cma.cross(s) / rxs;
    var u: number = cma.cross(r) / rxs;

    if (t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0) {
        return true;
    }
    else {
        return false;
    }
}

function entityIntersect(a: Vec, b: Vec, e: Entity): boolean {
    var halfSize: Vec = e.getComponent(CBoundingBox).halfSize;
    var pos: Vec = e.getComponent(CTransform).pos;

    var c: Vec = pos.subtract(halfSize);
    var d: Vec = new Vec(pos.x + halfSize.x, c.y);
    var i1: boolean = lineIntersect(a, b, c, d);

    d = new Vec(c.x, pos.y + halfSize.y);
    var i2: boolean = lineIntersect(a, b, c, d);

    c = new Vec(pos.x + halfSize.x, pos.y - halfSize.y);
    d = new Vec(c.x, pos.y + halfSize.y);
    var i3: boolean = lineIntersect(a, b, c, d);

    c = new Vec(pos.x - halfSize.x, pos.y + halfSize.y);
    d = new Vec(pos.x + halfSize.x, c.y);
    var i4: boolean = lineIntersect(a, b, c, d);

    return i1 || i2 || i3|| i4;
}

module.exports = {
    'getOverlap': getOverlap,
    'getPreviousOverlap': getPreviousOverlap,
    'lineIntersect': lineIntersect,
    'entityIntersect': entityIntersect
};
