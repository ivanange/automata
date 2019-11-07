// defining custom functions to make sets work as i want  


declare interface Set<T> {
    contains(val: any): boolean;
    push(val: any): Set<T>;
    isSubset(val: Set<T>): boolean;
}

type transition = [any, string, any]; // transition type : a tuple of state symbol state

function isArrayEqual(array1: Array<any>, array2: Array<any>) {
    return array1.sort().join(',') === array2.sort().join(',');
}


Set.prototype.contains = function (val) {
    if ((val) instanceof Set) {
        return [...(this)].filter((el) => el instanceof Set).find(function (el) {
            //
            return isArrayEqual([...val], [...el]);
        }) ? true : false;
    }
    return this.has(val);
}


Set.prototype.push = function (val) {
    if (!this.contains(val)) {
        return this.add(val);
    }
    return this;
}

Set.prototype.isSubset = function (val) {
    let arr = [...val];
    return arr.filter(el => this.contains(el)).length === arr.length;

}

