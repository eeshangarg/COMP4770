const EntityManager = require('../EntityManager.js');
const Entity = require('../Entity.js');

test('EntityManager', () => {
    var entityManager = new EntityManager();
    var tile = entityManager.addEntity('tile');
    var enemy = entityManager.addEntity('enemy');
    entityManager.update();

    expect(tile.id).toBe(0);
    expect(enemy.id).toBe(1);
    expect(entityManager.getAllEntities().length).toBe(2);
    expect(entityManager.getEntitiesByTag('tile').length).toBe(1);
    expect(entityManager.getEntitiesByTag('enemy').length).toBe(1);

    enemy.destroy();
    entityManager.addEntity('tile');
    entityManager.update();
    expect(entityManager.getAllEntities().length).toBe(2);
    expect(entityManager.getEntitiesByTag('tile').length).toBe(2);
    expect(entityManager.getEntitiesByTag('enemy').length).toBe(0);
});
