const Vec = require('../Vec.js');
const Entity = require('../Entity.js');
const Physics = require('../Physics.js');
const lineIntersect = Physics.lineIntersect;
const getPreviousOverlap = Physics.getPreviousOverlap;
const getOverlap = Physics.getOverlap;
const entityIntersect = Physics.entityIntersect;
const Components = require('../Components.js');
const CBoundingBox = Components.CBoundingBox;
const CTransform = Components.CTransform;



test('Physics Overlap', () => {

    var entityA = new Entity(0, 'player');
    var transform = new CTransform(new Vec(2.0, 3.0));
    var box = new CBoundingBox(new Vec(40, 40), true, true);

    entityA.addComponent(transform);
    entityA.addComponent(new CBoundingBox(new Vec(40, 40), true, true));


    var entityB = new Entity(1, 'tile');
    entityB.addComponent(new CTransform(new Vec(4.0, 3.0)));
    entityB.addComponent(new CBoundingBox(new Vec(40, 40), true, true));

    var result: Vec = Physics.getOverlap(entityA, entityB);
    expect(result.x).toBe(38);
    expect(result.y).toBe(40);
});

test('Physics PreviousOverlap', () => {
    var entityA = new Entity(0, 'player');
    entityA.addComponent(new CBoundingBox(new Vec(40, 40), true, true));
    entityA.addComponent(new CTransform(new Vec(2.0, 3.0)));

    var entityB = new Entity(1, 'tile');
    entityB.addComponent(new CBoundingBox(new Vec(40, 40), true, true));
    entityB.addComponent(new CTransform(new Vec(2.0, 3.0)));

    var result = getOverlap(entityA, entityB);
    expect(result.x).toBe(40);
    expect(result.y).toBe(40);

});

test('Physics LineIntersect', () => {
    var a = new Vec(2.0, 3.0);
    var b = new Vec(2.0, 3.0);

    var c = new Vec(2.0, 3.0);
    var d = new Vec(2.0, 3.0);

    var result = lineIntersect(a, b, c, d);
    expect(result).toBe(false);
 
});

test('Physics EntityIntersect', () => {
    var entity = new Entity(0, 'tile');

});