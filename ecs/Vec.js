// @flow
/* global module */

class Vec {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y; // TO DO, Remove me. Sqrt for all Vec. 
    }

    add(rhs: Vec): Vec {
        return new Vec(this.x + rhs.x, this.y + rhs.y);
    }

    subtract(rhs: Vec): Vec {
        return new Vec(this.x - rhs.x, this.y - rhs.y);
    }

    multiply(val: number): Vec {
        return new Vec(this.x * val, this.y * val);
    }

    divide(val: number): Vec {
        return new Vec(this.x / val, this.y / val);
    }

    norm(): Vec {
        let len: number = this.length();
        return new Vec(this.x / len, this.y / len);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    equals(rhs: Vec): boolean {
        return this.x == rhs.x && this.y === rhs.y;
    }

    addi(rhs: Vec) {
        this.x += rhs.x;
        this.y += rhs.y;
    }

    subtracti(rhs: Vec) {
        this.x -= rhs.x;
        this.y -= rhs.y;
    }

    muli(val: number) {
        this.x *= val;
        this.y *= val;
    }

    divi(val: number) {
        this.x /= val;
        this.y /= val;
    }

    abs(): Vec {
        return new Vec(this.x < 0 ? -this.x : this.x, this.y < 0 ? -this.y : this.y);
    }

    cross(rhs: Vec): number {
        return this.x * rhs.y - rhs.x * this.y;
    }

    dist(rhs: Vec): number {
        return Math.sqrt((this.x - rhs.x) * (this.x - rhs.x) + (this.y - rhs.y) * (this.y - rhs.y));
    }

    distf(rhs: Vec): number {
        return (this.x - rhs.x) * (this.x - rhs.x) + (this.y - rhs.y) * (this.y - rhs.y);
    }
}

module.exports = Vec;
