const Vec = require('../Vec.js');
const Entity = require('../Entity.js');
const Physics = require('../Physics.js');
const Components = require('../Components.js');
const CBoundingBox = Components.CBoundingBox;
const CTransform = Components.CTransform;

test('getOverlap', () => {
    var a = new Entity(0, 'player');
    a.addComponent(new CTransform(new Vec(2.0, 3.0)));
    a.addComponent(new CBoundingBox(new Vec(40, 40), true, true));

    var b = new Entity(1, 'tile');
    b.addComponent(new CTransform(new Vec(22.0, 23.0)));
    b.addComponent(new CBoundingBox(new Vec(40, 40), true, true));

    var result = Physics.getOverlap(a, b);
    expect(result.x).toBe(20);
    expect(result.y).toBe(20);
});

test('getPreviousOverlap', () => {
    var a = new Entity(0, 'player');
    a.addComponent(new CTransform(new Vec(2.0, 3.0)));
    a.addComponent(new CBoundingBox(new Vec(40, 40), true, true));
    a.getComponent(CTransform).prevPos = new Vec(2.0, 3.0);

    var b = new Entity(1, 'tile');
    b.addComponent(new CTransform(new Vec(22.0, 23.0)));
    b.addComponent(new CBoundingBox(new Vec(40, 40), true, true));
    b.getComponent(CTransform).prevPos = new Vec(22.0, 23.0);

    var result = Physics.getPreviousOverlap(a, b);
    expect(result.x).toBe(20);
    expect(result.y).toBe(20);
});

test('lineIntersect and entityIntersect', () => {
    var playerPos = new Vec(2.0, 3.0);
    var npcPos = new Vec(200.0, 3.0);
    var npcPos2 = new Vec(200.0, 60.0);

    var tile = new Entity(0, 'tile');
    tile.addComponent(new CTransform(new Vec(100.0, 3.0)));
    tile.addComponent(new CBoundingBox(new Vec(40, 40), true, true));

    var result = Physics.entityIntersect(playerPos, npcPos, tile);
    expect(result).toBeTruthy();
    result = Physics.entityIntersect(playerPos, npcPos2, tile);
    expect(result).toBeFalsy();

    playerPos = new Vec(2.0, 3.0);
    npcPos = new Vec(2.0, 300.0);
    tile.addComponent(new CTransform(new Vec(2.0, 350.0)));
    tile.addComponent(new CBoundingBox(new Vec(40, 40), true, true));
    result = Physics.entityIntersect(playerPos, npcPos, tile);
    expect(result).toBeFalsy();
});
