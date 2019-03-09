// @flow
/* global module */
/* global require */
// flowlint unclear-type:off

const Components = require('./Components.js');
const Component = Components.Component;

class Entity {
    id: number;
    tag: string;
    active: boolean;
    componentArray: Array<Component | null>;

    constructor(id: number, tag: string) {
        this.id = id;
        this.tag = tag;
        this.active = true;
        this.componentArray = new Array(Components.MAX_COMPONENTS);
        this.componentArray.fill(null);
    }

    isActive(): boolean {
        return this.active;
    }

    destroy() {
        this.active = false;
    }

    hasComponent(componentClass: typeof Component): boolean {
        return this.componentArray[componentClass.INDEX] !== null;
    }

    getComponent(componentClass: typeof Component): any {
        return this.componentArray[componentClass.INDEX];
    }

    removeComponent(componentClass: typeof Component) {
        this.componentArray[componentClass.INDEX] = null;
    }

    addComponent(component: any): any {
        const index = component.constructor.INDEX;
        this.componentArray[index] = component;
        return component;
    }
}

module.exports = Entity;
