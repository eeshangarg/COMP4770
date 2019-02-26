// @flow
/* global module */
/* global require */

//const Components = require('./Components.js');
//const CBoundingBox = Components.CBoundingBox;
//const CTransform = Components.CTransform;
const Vec = require('./Vec.js');
const Entity = require('./Entity.js');


function getOverlap(a: Entity, b: Entity): Vec {

	var aPos: Vec = a.getComponent.CTransform().pos;
    //var y1: Vec = a.getComponent.CTransform().pos.y;
    var bPos: Vec = b.getComponent.CTransform().pos;
   // var y2: Vec = b.getComponent.CTransform().pos.y;
	//Vec delta(abs(x1-x2), abs(y1-y2));
	var negDelta: Vec = aPos.subtract(bPos);
	var delta: Vec = negDelta.abs();
   // var w1: Vec = a.getComponent.CBoundingBox().halfSize.x;
	//var h1: Vec = a.getComponent.CBoundingBox().halfSize.y;
	var w1h1: Vec = a.getComponent.CBoundingBox().halfSize;
    //var w2: Vec = b.getComponent.CBoundingBox().halfSize.x;
	//var h2: Vec = b.getComponent.CBoundingBox().halfSize.y;
	var w2h2: Vec = b.getComponent.CBoundingBox().halfSize;
    //var ox: Vec = w1 + w2 - delta.x;
	//var oy: Vec = h1 + h2 - delta.y;
	var oxy: Vec = w1h1.add(w2h2).subtract(delta);
	return oxy; //Vec(ox, oy);
}

function getPreviousOverlap(a: Entity, b: Entity): Vec {
	var aPrevPos: Vec = a.getComponent.CTransform().prevPos;
   // var y1: Vec = a.getComponent.CTransform().prevPos.y;
    var bPrevPos: Vec = b.getComponent.CTransform().prevPos;
   // var y2: Vec = b.getComponent.CTransform().prevPos.y;
	//Vec2 delta(MATH.abs(x1-x2), MATH.abs(y1-y2));
	var negDelta: Vec = aPrevPos.subtract(bPrevPos);
	var delta: Vec = negDelta.abs();
    //var w1: Vec = a.getComponent.CBoundingBox().halfSize.x;
	//var h1: Vec = a.getComponent.CBoundingBox().halfSize.y;
	var w1h1: Vec = a.getComponent.CBoundingBox().halfSize;
    //var w2: Vec = b.getComponent.CBoundingBox().halfSize.x;
	//var h2: Vec = b.getComponent.CBoundingBox().halfSize.y;
	var w2h2: Vec = b.getComponent.CBoundingBox().halfSize;
    //var ox: Vec = w1 + w2 - delta.x;
	//var oy: Vec = h1 + h2 - delta.y;
	var oxy: Vec = w1h1.add(w2h2).subtract(delta);
	return oxy; //Vec(ox, oy);
}

function lineIntersect(a: Vec, b: Vec, c: Vec, d: Vec): boolean {
	if (b == c || b == d) { return false; }

	var r: Vec = b.subtract(a);
    var s: Vec = d.subtract(c);
    var rxs: number = r.cross(s);//(r * s); 
    var cma: Vec = c.subtract(a);
    var t: number = cma.cross(s) / rxs;
    var u: number = cma.cross(r) / rxs;

    if (t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0)
        return true; //Vec(a.x + t*r.x, a.y + t*r.y) };
    else
		return false; // , Vec(0.0, 0.0) };

}

function entityIntersect(a: Vec, b: Vec, e: Entity): boolean {

	var halfSize: Vec = e.getComponent.CBoundingBox().halfSize;
	
    var pos: Vec = e.getComponent.CTransform().pos;

	//var c: Vec = Vec(pos.x - halfSize.x, pos.y - halfSize.y);
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



module.exports.getOverlap = getOverlap;  
module.exports.getPreviousOverlap = getPreviousOverlap;  
module.exports.lineIntersect = lineIntersect;  
module.exports.entityIntersect = entityIntersect;  





