const Animation = require('../Animation.js');
const {setAnimation, getAnimation, draw, update, loadAnimations} = require('../Animator.js');


test('Animator', () => {
    setAnimation("dummy", "someSpirte", 2, 30, 64, 64);
    setAnimation("frame", "someSpirte", 1, 30, 64, 64);
    let anim = getAnimation("dummy");
    let frame = getAnimation("frame");
    update(frame);
    update(anim);
    update(anim);
    update(anim);
    update(anim);
    expect(anim.AnimationName).toBe("dummy");
    draw(anim);
    expect(anim.CurrentFrame).toBe(0);
    expect(anim.AnimationFrame).toBe(0);
});
