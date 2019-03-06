// @flow
/* global module */
/* global require */

const Entity = require('./Entity.js');

class EntityManager {
    entities: Array<Entity>;
    entitiesToAdd: Array<Entity>;
    entityMap: { [tag: string]: Array<Entity> };
    totalEntities: number;

    constructor() {
        this.entities = [];
        this.entitiesToAdd = [];
        this.entityMap = {};
        this.totalEntities = 0;
    }

    getAllEntities(): Array<Entity> {
        return this.entities;
    }

    getEntitiesByTag(tag: string): Array<Entity> {
        return this.entityMap[tag];
    }

    addEntity(tag: string): Entity {
        const entity = new Entity(this.totalEntities++, tag);
        this.entitiesToAdd.push(entity);
        return entity;
    }

    removeDeadEntities(entityVec: Array<Entity>) {
        for (var i = 0; i < entityVec.length; i++) {
            const entity = entityVec[i];
            if (!entity.isActive()) {
                entityVec.splice(i, 1);
            }
        }
    }

    update() {
        // add all entities that are pending
        for (var i = 0; i < this.entitiesToAdd.length; i++) {
            const entity = this.entitiesToAdd[i];
            // add it to the vector of all entities
            this.entities.push(entity);

            // add it to the entity map in the correct place
            if (!(entity.tag in this.entityMap)) {
                this.entityMap[entity.tag] = [];
            }
            this.entityMap[entity.tag].push(entity);
        }

        // clear the temporary array since we have added everything
        this.entitiesToAdd = [];
        this.entitiesToAdd.length = 0;

        // clean up dead entities in all arrays
        this.removeDeadEntities(this.entities);
        let tags = Object.keys(this.entityMap);
        for (let i = 0; i < tags.length; i++) {
            let tag = tags[i];
            this.removeDeadEntities(this.entityMap[tag]);
        }
    }
}

module.exports = EntityManager;
