const Animation = require('../Animation.js');
const {
    setAnimation,
    getAnimation,
    draw,
    update,
    loadAnimations
} = require('../Rendering.js');


test('Rendering', () => {
    // Create some abitary animation objects.
    setAnimation("dummy", "someSpirte", "someSpirte", 0, 0, 2, 30, 64, 64);
    setAnimation("frame", "someSpirte", "someSpirte", 1, 1, 1, 30, 64, 64);
    let anim = getAnimation("dummy");
    let frame = getAnimation("frame");
    update(frame);
    // Cycle through the frames. 
    update(anim);
    update(anim);
    update(anim);
    update(anim);
    // Test expect.
    expect(anim.name).toBe("dummy");
    expect(anim.currentFrame).toBe(0);
    expect(anim.animationFrame).toBe(0);
});
