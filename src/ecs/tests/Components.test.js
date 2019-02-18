const Components = require('../Components.js');
const CTransform = Components.CTransform;
const CInput = Components.CInput;
const CBoundingBox = Components.CBoundingBox;
const CGravity = Components.CGravity;
const CHealth = Components.CHealth;
const CState = Components.CState;
const CDraggable = Components.CDraggable;
const CFollow = Components.CFollow;
const CPatrol = Components.CPatrol;
const Vec = require('../Vec.js');

test('Components', () => {
    var transform = new CTransform(new Vec(2.0, 3.0));
    var input = new CInput();

    var box = new CBoundingBox(new Vec(40, 40), true, true);
    expect(box.halfSize.x).toBe(20);
    expect(box.halfSize.y).toBe(20);

    var gravity = new CGravity(2.0);
    var health = new CHealth();
    expect(health.health).toBe(100);

    var state = new CState('stand');
    var draggable = new CDraggable();
    var follow = new CFollow(new Vec(2.0, 3.0), 5.0);
    var patrol = new CPatrol([1.0, 2.0, 3.0, 4.0], 5.0);
});
