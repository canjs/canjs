var foo = getFromGlobal(global, "foo");

function getFromGlobal(global, prop) {
	return global[prop];
}
