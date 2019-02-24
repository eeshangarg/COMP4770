const Animation = require('../Animation.js');
const {setAnimation, getAnimation, draw, update, loadAnimations} = require('../Animator.js');
loadAnimations('./src/rendering/Animation.json');

test('Animator', () => {
    let anim = getAnimation("playerAtkLAnim");
    update(anim);
    expect(anim).toBe("playerAtkLAnim");
    draw(anim);
    expect(anim.CurrentFrame).toBe(1);
    expect(anim.AnimationFrame).toBe(0);
});
