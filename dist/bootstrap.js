// defining custom functions to make sets work as i want  
require('es7-object-polyfill');
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            Object.defineProperty(derivedCtor.prototype, name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name));
        });
    });
}
function isArrayEqual(array1, array2) {
    return array1.length === array2.length && array1.map(e => e + "").sort().join(',') === array2.sort().join(',');
}
Set.prototype.intersect = function (set) {
    return new Set([...set].filter(el => this.contains(el)));
};
Set.prototype.contains = function (val) {
    if ((val) instanceof Set) {
        return [...(this)].filter((el) => el instanceof Set).find(function (el) {
            //
            return isArrayEqual([...val], [...el]);
        }) ? true : false;
    }
    return this.has(val) || (typeof val == 'string' ? this.has(parseFloat(val)) : this.has(val + ""));
};
Set.prototype.push = function (val) {
    if (!this.contains(val)) {
        return this.add(val);
    }
    return this;
};
Set.prototype.pushArray = function (array) {
    for (let s of array) {
        this.push(s);
    }
    return this;
};
Set.prototype.isSubset = function (val) {
    let arr = [...val];
    return arr.filter(el => this.contains(el)).length === arr.length;
};
Set.prototype.toString = function (notation = "{,}", wrapper = ",") {
    let notationA = notation.split(",");
    return `${notationA[0] + [...this].stringify(notation, wrapper) + notationA[1]}`;
};
Set.prototype.zip = function (set, callback) {
    return new Set([...this].zip([...set], callback));
};
Set.prototype.toJSON = function () {
    return [...this];
};
Array.prototype.stringify = function (notation = "{,}", wrapper = ',') {
    wrapper = wrapper.split(",");
    wrapper[1] = wrapper[1] || wrapper[0];
    return this.map((el) => (el instanceof Set || el instanceof Array ? el.toString(notation, wrapper.join(",")) : wrapper[0] + el + wrapper[1])).join(",");
};
Array.prototype.toString = function (notation = "{,}", wrapper = ",") {
    return `[${this.stringify(notation, wrapper)}]`;
};
Array.prototype.toSet = function () {
    return new Set(this.map(el => el instanceof Array ? el.toSet() : el));
};
Array.prototype.mapToSet = function () {
    return this.map(el => el instanceof Array ? el.toSet() : el);
};
Array.prototype.mapToInt = function () {
    return this.map(el => el instanceof Array ? el.mapToInt() : eval(el));
};
Array.prototype.zip = function (arr, callback) {
    return [].concat(...this.map(el => arr.map(e => callback ? callback(el, e) : new Set([el, e]))));
};
