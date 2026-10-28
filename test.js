const assert = require("assert")
const { greet } = require("./src/greeting")

assert.strictEqual(greet("Ana"), "Hello, Ana!")
console.log("1 passing")
