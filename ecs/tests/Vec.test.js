const Vec = require('../Vec.js');

test('Vec addition', () => {
    var v = new Vec(2.0, 3.0);
    var result = v.add(new Vec(1.0, 2.0));
    expect(result.x).toBe(3.0);
    expect(result.y).toBe(5.0);
    
    v.addi(new Vec(1.0, 2.0));
    expect(v.x).toBe(3.0);
    expect(v.y).toBe(5.0);
});

test('Vec subtraction', () => {
    var v = new Vec(2.0, 3.0);
    var result = v.subtract(new Vec(1.0, 2.0));
    expect(result.x).toBe(1.0);
    expect(result.y).toBe(1.0);
    
    v.subtracti(new Vec(1.0, 2.0));
    expect(v.x).toBe(1.0);
    expect(v.y).toBe(1.0);
});

test('Vec multiplication', () => {
    var v = new Vec(2.0, 3.0);
    var result = v.multiply(2.0);
    expect(result.x).toBe(4.0);
    expect(result.y).toBe(6.0);
    
    v.muli(2.0);
    expect(v.x).toBe(4.0);
    expect(v.y).toBe(6.0);
});

test('Vec division', () => {
    var v = new Vec(2.0, 3.0);
    var result = v.divide(2.0);
    expect(result.x).toBe(1.0);
    expect(result.y).toBe(1.5);
    
    v.divi(2.0);
    expect(v.x).toBe(1.0);
    expect(v.y).toBe(1.5);
});

test('Vec length and norm', () => {
    var v = new Vec(0.0, 3.0);
    expect(v.length).toBe(3.0);
    var norm = v.norm();
    expect(norm.x).toBe(0.0);
    expect(norm.y).toBe(1.0);
    expect(norm.length).toBe(1.0);
});

test('Vec abs', () => {
    var v = new Vec(-1.0, 3.0);
    var abs = v.abs();
    expect(abs.x).toBe(1.0);
    expect(abs.y).toBe(3.0);

    v = new Vec(-1.0, -3.0);
    abs = v.abs();
    expect(abs.x).toBe(1.0);
    expect(abs.y).toBe(3.0);

    v = new Vec(1.0, 3.0);
    abs = v.abs();
    expect(abs.x).toBe(1.0);
    expect(abs.y).toBe(3.0);
});

test('Vec dist', () => {
    var v1 = new Vec(5, 6);
    var v2 = new Vec(-7, 11);
    expect(v1.dist(v2)).toBe(13);
});

test('Vec fast-dist', () => {
    var v1 = new Vec(5, 6);
    var v2 = new Vec(-7, 11);
    expect(v1.fastDist(v2)).toBe(169);
});

test('Vec cross', () => {
    var v1 = new Vec(2, 3);
    var v2 = new Vec(4, 5);
    expect(v1.cross(v2)).toBe(-2);
});

test('Vec equals', () => {
    var v1 = new Vec(2, 3);
    var v2 = new Vec(3, 5);
    var v3 = new Vec(2, 3);
    expect(v1.equals(v2)).toBeFalsy();
    expect(v1.equals(v3)).toBeTruthy();
});

