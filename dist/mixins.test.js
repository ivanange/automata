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
let F = new AF(new Set([0, 1, 2, 3, 4, 5, 6]), 0, new Set([1, 3, 4, 6]), new Set("ab"), [
    [0, "a", 1], [0, "b", 2], [1, "a", 4], [1, "b", 3], [2, "a", 3], [2, "b", 5], [3, "a", 6], [3, "b", 6],
    [4, "a", 6], [4, "b", 2], [5, "a", 6], [5, "b", 3], [6, "a", 6], [6, "b", 6]
]);
let G = new AF(new Set([1, 2, 3, 4, 5, 6, 7, 8]), 1, new Set([8]), new Set("ab"), [
    [1, "a", 2], [1, "b", 4], [2, "a", 3], [2, "b", 5], [3, "a", 6], [3, "b", 1], [4, "a", 3], [4, "b", 7],
    [5, "a", 8], [5, "b", 6], [6, "a", 3], [6, "b", 6], [7, "a", 8], [7, "b", 6], [8, "a", 8], [8, "b", 7]
]);
console.log(
// F.minimise().toString(),
// G.minimise().toString(),
AF.recognizeText(["if", "else", "cash", "while", "for", "let", "more", "$ta", "do", "$12ab"], [AF.fromRegex("if+else+let+while+do", "keyword"), AF.fromRegex("$.(1+2+3+4+5+6+7+8+9+0+a+b+c+t+m+o+r+e)*", "variable")]));
//     AF.recognizeText(["if", "else", "cash", "while", "for",  "let", "more", "$a", "do",  "$12ab"], [AF.fromRegex("if+else+let"), AF.fromRegex("$.(1+2+3+4+5+6+7+8+9+0+a+b+c)*")])
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
console.log(
//B.isComplete(),
//D.isDeterministic(),
);
// s = AF.fromRegex(D.toRegex())
//s = AF.fromRegex("a+b")
// let s = C.toRegex();
// let K = AF.fromRegex(s);
console.log(
//E.analyze("aaaaabccccc".split("")),
//E.eAFNtoAFN(),
//E.thompsonUnite([E.thompsonSymbol("b"), E.thompsonSymbol("a")])
//E.thomposnIterate(E.thompsonUnite([E.thompsonSymbol("b"), E.thompsonSymbol("a")])),
/*
    AF.parseRegex("a+b"),
    AF.parseRegex("(a+b)"),
    AF.parseRegex("(a+b)*"),
    AF.parseRegex("(a+b)*.c"),
    AF.parseRegex("(a+b)*.c*"),
    AF.parseRegex("((a.b.b+b.b)*.(a.a)*)*"),
*/
//E.fromRegex("((a.b.b+b.b)*.(a.a)*)*").analyze("aaabbbbaa".split("")), 
// .analyze("aaa".split(""))
//s,
//s.eSingleFermeture('6'),
//s.recognize("aaabbbbaa"),
//s,
//AF.parseJson(E.toJson()),
//D.toRegex(),
//s.recognize("aaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbaaaaaaaaababababababaabababababaabbaba"),
//D.toJson(),
//s, K,
//[].zip([]).toString(),
);
/**
 *
let k = AF.fromRegex("a.b").toAFD();
let o = AF.fromRegex("a.a*.b").toAFD();
let KO = AF.clotureUnion([k, o]);
let KI = AF.clotureIntersection([k, o]);
let KM = AF.clotureMiroir(k);
let KC = AF.clotureConcatenation([k, o]);
 */
console.log(
//D.recognize("aaaaaaaaaaaaaaabbababababababababababababa"),
//AF.fromRegex("(a+b)*").toRegex(),
//K.recognize("aaaaaaaaaaaaaaabbababababababababababababa")
/**
 *
    k.toJson(),
    o.toJson(),
    KO.toJson(),
    KO.recognize("ab"),
    KO.recognize("aab"),
    KI.recognize("ab"),
    KM.recognize("ba"),
    KC.recognize("abab"),
 */
);
