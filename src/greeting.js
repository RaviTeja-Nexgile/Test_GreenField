// Checked by hand on 28 Oct, after wave 1 was skipped.
// The greeting the app says.

function greet(name) {
	return `Hello, ${name}!`
}

// Wave 1's task: the greeting shouted in capitals. It failed its tests and was skipped.
function shout(name) {
	return greet(name).toUpperCase() + "!!"
}

module.exports = { greet, shout }
