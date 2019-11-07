// defining custom functions to make sets work as i want  
function isArrayEqual(array1, array2) {
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
};
Set.prototype.push = function (val) {
    if (!this.contains(val)) {
        return this.add(val);
    }
    return this;
};
Set.prototype.isSubset = function (val) {
    let arr = [...val];
    return arr.filter(el => this.contains(el)).length === arr.length;
};
