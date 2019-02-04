// @flow

class Vec {
    x: number;
    y: number;
    length: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);
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
        return new Vec(this.x / this.length, this.y / this.length);
    }

    equals(rhs: Vec): boolean {
        return this.x == rhs.x && this.y == rhs.y;
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
        return (this.x - rhs.x) * (this.x - rhs.x) + (this.y - rhs.y) * (this.y - rhs.y);
    }
}

module.exports = Vec;
