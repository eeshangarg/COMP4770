// @flow
/* global module */
/* global require */

const Components = require('./Components.js');
const CBoundingBox = Components.CBoundingBox;
const CTransform = Components.CTransform;
const Vec = require('./Vec.js');
const Entity = require('./Entity.js');


function getOverlap(a: Array<Entity>, b: Array<Entity>): Vec {
	var aBB: Vec = a.getComponent(CBoundingBox).halfSize;
	var aPos: Vec = a.getComponent(CTransform).pos;
	var bBB: Vec = b.getComponent(CBoundingBox).halfSize;
	var bPos: Vec = b.getComponent(CTransform).pos;
	return Vec((aBB.x + bBB.x) - Math.abs(bPos.x - aPos.x), (aBB.y + bBB.y) - Math.abs(bPos.y - aPos.y));

}

function getPreviousOverlap(a: Array<Entity>, b: Array<Entity>): Vec {
	var aBB: Vec = a.getComponent(CBoundingBox).halfSize;
	var aPos: Vec = a.getComponent(CTransform).prevPos;
	var bBB: Vec = b.getComponent(CBoundingBox).halfSize;
	var bPos: Vec = b.getComponent(CTransform).pos;
	return Vec((aBB.x + bBB.x) - Math.abs(bPos.x - aPos.x), (aBB.y + bBB.y) - Math.abs(bPos.y - aPos.y));

}

function lineIntersect(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
	if (b == c || b == d) { return false; }

	var r: Vec = b - a;
	var s: Vec = d - c;
	var rxs: float = r * s;
	var cma: Vec = c - a;
	var t: float = (cma * s) / rxs;
	var u: float = (cma * r) / rxs;
	return (t >= 0 && t <= 1 && u >= 0 && u <= 1);

}

function entityIntersect(a: Vec, b: Vec, e: Array<Entity>): boolean {

	var p: Vec = e.getComponent(CTransform).pos;
	var bb: Vec = e.getComponent(CBoundingBox).halfSize;


	if (lineIntersect(a, b, Vec(p.x - bb.x, p.y + bb.y), Vec(p.x + bb.x, p.y + bb.y)))
	{ return true; }

	else if (lineIntersect(a, b, Vec(p.x + bb.x, p.y + bb.y), Vec(p.x + bb.x, p.y - bb.y)))
	{ return true; }

	else if (lineIntersect(a, b, Vec(p.x + bb.x, p.y - bb.y), Vec(p.x - bb.x, p.y - bb.y)))
	{ return true; }

	else if (lineIntersect(a, b, Vec(p.x - bb.x, p.y - bb.y), Vec(p.x - bb.x, p.y + bb.y)))
	{ return true; }

	else { return false; }

}

function lightEntityIntersect(a: Vec, b: Vec, e: Array<Entity>): boolean {
	var p: Vec = e.getComponent(CTransform).pos;
	p.y = 768 - p.y;

	var bb: Vec = e.getComponent(CBoundingBox).halfSize;


	if (lineIntersect(a, b, Vec(p.x - bb.x, p.y + bb.y), Vec(p.x + bb.x, p.y + bb.y)))
	{ return true; }

	else if (lineIntersect(a, b, Vec(p.x + bb.x, p.y + bb.y), Vec(p.x + bb.x, p.y - bb.y)))
	{ return true; }

	else if (lineIntersect(a, b, Vec(p.x + bb.x, p.y - bb.y), Vec(p.x - bb.x, p.y - bb.y)))
	{ return true; }

	else if (lineIntersect(a, b, Vec(p.x - bb.x, p.y - bb.y), Vec(p.x - bb.x, p.y + bb.y)))
	{ return true; }

	else { return false; }

}

module.exports.getOverlap = getOverlap;  
module.exports.getPreviousOverlap = getPreviousOverlap;  
module.exports.lineIntersect = lineIntersect;  
module.exports.entityIntersect = entityIntersect;  
module.exports.lightEntityIntersect = lightEntityIntersect;  





