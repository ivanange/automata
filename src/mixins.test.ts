import AF from "./AF";

let A = new AF(new Set([1, 2, 3, 4]), 1, new Set([4]), new Set("ab"), [
    [1, "a", 1], [1, "a", 2], [2, "b", 3], [2, "a", 4], [3, "b", 3], [3, "b", 4]
]);

let B = A.complete();

let C = new AF(new Set([1, 2, 3, 4]), 1, new Set([4]), new Set("ab"), [
    [1, "a", 2], [1, "a", 3], [2, "a", 4], [3, "a", 3], [3, "b", 4], [4, "b", 2]
]);

let D = C.determinise();

let E = new AF(new Set([0, 1, 2]), 0, new Set([2]), new Set("abc"), [
    [0, "a", 0], [0, AF.e, 1], [1, "b", 1], [1, AF.e, 2], [2, "c", 2]
]);
/*

console.log(
    "NC: \n",
    "A:", A.isComplete(),
    "B:", B.isComplete(),
    "\nND: \n",
    "C:", C.isDeterministic(),
    "D:", D.isDeterministic(),
    "\n",
    D.toJson(),
    JSON.parse(D.toJson()),

);


    [].concat(
        [0],
        s = E.transiter(AF.e, 0),
        ...(s.length > 0 ? s.map(el => E.eSingleFermeture(el)) : [[]])
    ),

        E.optimize([].concat(...[0, 1, 2].map(e => E.transiter("a", e)))),
    E.transiterArray("a", [1, 2, 0]),
*/
// E.transiter("a", 0)
let s;
console.log(


);

console.log(
    E.analyze("aaaaabcccccb".split("")),
    E.eAFNtoAFN(),
)