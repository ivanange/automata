import AF from "./AF";
let A = new AF(new Set([1, 2, 3, 4]), 1, new Set([4]), new Set("ab"), [
    [1, "a", 1], [1, "a", 2], [2, "b", 3], [2, "a", 4], [3, "b", 3], [3, "b", 4]
]);
let B = A.complete();
let C = new AF(new Set([1, 2, 3, 4]), 1, new Set([4]), new Set("ab"), [
    [1, "a", 2], [1, "a", 3], [2, "a", 4], [3, "a", 3], [3, "b", 4], [4, "b", 2]
]);
let D = C.determinise();
let json = D.toJson();
let point = 324;
console.log(json.slice(point - 40, point + 40));
console.log("NC: \n", "A:", A.isComplete(), "B:", B.isComplete(), "\nND: \n", "C:", C.isDeterministic(), "D:", D.isDeterministic(), "\n", D.toJson()[241], JSON.parse(D.toJson()));
