import "./bootstrap";
let a = new Set(["x1", "x2", "x3", "x4", new Set("abc"), 5, 6, 7]);
console.log(a.contains(new Set("abc")), a.push(new Set("abc")), new Set("aabc"));
console.log(a.toString());
