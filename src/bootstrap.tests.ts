import "./bootstrap";

let a = new Set([1, 2, 3, 4, new Set("abc"), 5, 6, 7]);
console.log(a.contains(new Set("abc")), a.push(new Set("abc")), new Set("aabc")); 
