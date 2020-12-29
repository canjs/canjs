var mySteal = require('@steal');

if(typeof window !== "undefined" && window.QUnit) {

	QUnit.ok(mySteal.System == System, "The steal's loader is the loader");

	QUnit.start();
	removeMyself();
} else {
	console.log("Systems", mySteal.System == System);
}
