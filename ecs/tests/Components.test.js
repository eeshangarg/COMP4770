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
const CAnimation = Components.CAnimation;
const Vec = require('../Vec.js');
const Animation = require('../../rendering/Animation.js');

test('Components', () => {
    var transform = new CTransform(new Vec(2.0, 3.0));
    expect(CTransform.INDEX).toBe(0);

    var input = new CInput();
    expect(CInput.INDEX).toBe(1);

    var box = new CBoundingBox(new Vec(40, 40), true, true);
    expect(box.halfSize.x).toBe(20);
    expect(box.halfSize.y).toBe(20);
    expect(CBoundingBox.INDEX).toBe(2);

    var gravity = new CGravity(2.0);
    expect(CGravity.INDEX).toBe(3);

    var health = new CHealth(100);
    expect(health.health).toBe(100);
    expect(CHealth.INDEX).toBe(4);

    var state = new CState('stand');
    expect(CState.INDEX).toBe(5);

    var draggable = new CDraggable();
    expect(CDraggable.INDEX).toBe(6);

    var follow = new CFollow(new Vec(2.0, 3.0), 5.0);
    expect(CFollow.INDEX).toBe(7);

    var patrol = new CPatrol([1.0, 2.0, 3.0, 4.0], 5.0);
    expect(CPatrol.INDEX).toBe(8);

    var animation = new CAnimation("SomeAnimName", 0);
    expect(CAnimation.INDEX).toBe(9);
});
