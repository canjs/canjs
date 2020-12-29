import {DefineMap, QueryLogic} from "can";

class DateStringSet {
	constructor(value){
		this.value = value;
	}
	// used to convert to a number
	valueOf(){
		return new Date(this.value).getTime();
	}
	[Symbol.for("can.serialize")](){
        return this.value;
    }
}

const DateString = {
	[Symbol.for("can.new")]: function(v){ return v; },
	[Symbol.for("can.SetType")]: DateStringSet
};

const Todo = DefineMap.extend({
	id: {type: "number", identity: true},
	name: "string",
	date: DateString
});

const queryLogic = new QueryLogic(Todo);

const filter = queryLogic.filterMembers(
	{filter: {date: {$gt: "Wed Apr 04 2018 10:00:00 GMT-0500 (CDT)"}}},
	[{id: 1, name: "Learn CanJS", date: "Thurs Apr 05 2017 10:00:00 GMT-0500 (CDT)"},
	{id: 2, name: "grab coffee", date: "Wed Apr 03 2018 10:00:00 GMT-0500 (CDT)"},
	{id: 3, name: "finish these docs", date: "Thurs Apr 05 2018 10:00:00 GMT-0500 (CDT)"}]
);

console.log(filter); //-> [{
// 	id: 2,
// 	name: "finish these docs",
// 	date: "Wed Apr 05 2018 10:00:00 GMT-0500 (CDT)"
// }]
