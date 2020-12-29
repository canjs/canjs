if(typeof window !== "undefined" && window.QUnit) {
	QUnit.ok(true, "Loaded the main in nwjs");

	QUnit.start();
	removeMyself();
} else {
	console.log("Yay");
}
