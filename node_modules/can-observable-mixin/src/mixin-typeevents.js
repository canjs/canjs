const addTypeEvents  = require("can-event-queue/type/type");
const addMapEvents  = require("can-event-queue/map/map");

function mixinTypeEvents(Type) {
	let Child = class extends Type {};
	addTypeEvents(Child);
	addMapEvents(Child);
	return Child;
}

module.exports = mixinTypeEvents;
