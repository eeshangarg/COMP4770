const Entity = require('../Entity.js');
const Components = require('../Components.js');
const CInput = Components.CInput;

test('Entity', () => {
    var entity = new Entity(0, 'tile');

    expect(entity.hasComponent(CInput)).toBeFalsy();
    entity.addComponent(new CInput());
    expect(entity.hasComponent(CInput)).toBeTruthy();
    const input = entity.getComponent(CInput);
    expect(input.up).toBeFalsy();
    entity.removeComponent(CInput);
    expect(entity.hasComponent(CInput)).toBeFalsy();
    expect(entity.getComponent(CInput)).toBe(null);

    expect(entity.isActive()).toBeTruthy();
    entity.destroy();
    expect(entity.isActive()).toBeFalsy();
});
