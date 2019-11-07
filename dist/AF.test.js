import AF from "./AF";
// tests 
let a = new Set([0, 1, 2]);
try {
    //AFD
    // epselon transition : , [2, "", 2]
    let A = new AF(a, 0, new Set([0]), new Set("ab"), [
        [0, "b", 0], [0, "a", 1], [1, "b", 1], [1, "a", 2], [2, "b", 2], [2, "a", 0]
    ]);
    console.log(
    // A.analyze("abbaaaabbbbababaababbba".split(""))
    A.isDeterministic(), A.isComplete());
    //AFN 
    let B = new AF(new Set([1, 2, 3, 4]), 1, new Set([4]), new Set("ab"), [
        [1, "a", 1], [1, "a", 2], [2, "b", 3], [2, "a", 4], [3, "b", 3], [3, "b", 4]
    ]);
    let s = "aa";
    // B.analyze("ab".split(""))
    console.log(
    //B.recognize(s),
    B.isDeterministic(), B.isComplete());
}
catch (e) {
    console.log(e);
}
