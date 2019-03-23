// @flow
/* global module */
/* global require */

const Vec = require('./Vec.js');
const Entity = require('./Entity.js');
const Components = require('./Components.js');
const CTransform = Components.CTransform;
const CBoundingBox = Components.CBoundingBox;


/* istanbul ignore next */
function isOnScreen (e: Entity, playerPos: Vec, screenSize: Vec): boolean {
    let pos: Vec = e.getComponent(CTransform).pos;
    let delta: Vec = new Vec(Math.abs(pos.x - playerPos.x), Math.abs(pos.y - playerPos.y));
    if (e.hasComponent(CBoundingBox)) {
        let halfSize: Vec = e.getComponent(CBoundingBox).halfSize;
        let sum: Vec = halfSize.add(screenSize);
        sum.subtracti(delta);
        if (sum.x >0 && sum.y > 0) { return true } 
        else {return false;}
    }
    else {
        let halfSize: Vec = new Vec(0,0);
        let sum: Vec = halfSize.add(screenSize);
        sum.subtracti(delta);
        if (sum.x >0 && sum.y > 0) { return true } 
        else {return false;}
    }

}

function getOverlap(a: Entity, b: Entity): Vec {
    let aPos: Vec = a.getComponent(CTransform).pos;
    let aHalfSize: Vec = a.getComponent(CBoundingBox).halfSize;
    let bPos: Vec = b.getComponent(CTransform).pos;
    let bHalfSize: Vec = b.getComponent(CBoundingBox).halfSize;
    let delta: Vec = new Vec(Math.abs(aPos.x - bPos.x), Math.abs(aPos.y - bPos.y));
    let sum: Vec = aHalfSize.add(bHalfSize);
    let overlap: Vec = sum.subtract(delta);
    return overlap;
}

function getPreviousOverlap(a: Entity, b: Entity): Vec {
    let aPos: Vec = a.getComponent(CTransform).prevPos;
    let aHalfSize: Vec = a.getComponent(CBoundingBox).halfSize;
    let bPos: Vec = b.getComponent(CTransform).prevPos;
    let bHalfSize: Vec = b.getComponent(CBoundingBox).halfSize;
    let delta: Vec = new Vec(Math.abs(aPos.x - bPos.x), Math.abs(aPos.y - bPos.y));
    let sum: Vec = aHalfSize.add(bHalfSize);
    let overlap: Vec = sum.subtract(delta);
    return overlap;
}

function lineIntersect(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
    let cma: Vec = c.subtract(a);
    let r: Vec = b.subtract(a);
    let s: Vec = d.subtract(c);
    let rxs: number = r.cross(s);
    let t: number = cma.cross(s) / rxs;
    if (t >= 0.0 && t <= 1.0) {
        let u: number = cma.cross(r) / rxs;
        if (u >= 0.0 && u <= 1.0) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function entityIntersect(a: Vec, b: Vec, e: Entity): boolean {
    let halfSize: Vec = e.getComponent(CBoundingBox).halfSize;
    let pos: Vec = e.getComponent(CTransform).pos;
    let x: Vec = new Vec(pos.x - halfSize.x, pos.y + halfSize.y);
    let y: Vec = pos.add(halfSize);
    let z: Vec = new Vec(pos.x + halfSize.x, pos.y - halfSize.y);
    let w: Vec = pos.subtract(halfSize);
    if ( lineIntersect(a, b, x, y) || lineIntersect(a, b, y, z) ||
         lineIntersect(a, b, z, w) || lineIntersect(a, b, w, x)) {
        return true;
    } else {
        return false;
    }

}

module.exports = {
    'isOnScreen': isOnScreen,
    'getOverlap': getOverlap,
    'getPreviousOverlap': getPreviousOverlap,
    'lineIntersect': lineIntersect,
    'entityIntersect': entityIntersect
};