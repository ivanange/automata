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
    let B = new AF(new Set(["x1", "x2", "x3", "x4"]), "x1", new Set(["x4"]), new Set("ab"), [
        ["x1", "a", "x1"], ["x1", "a", "x2"], ["x2", "b", "x3"], ["x2", "a", "x4"], ["x3", "b", "x3"], ["x3", "b", "x4"]
    ]);
    let s = "aa";
    // B.analyze("ab".split(""))
    console.log(
    //B.recognize(s),
    B.isDeterministic(), B.isComplete(), B.toString(), B.toJson());
}
catch (e) {
    console.log(e);
}
