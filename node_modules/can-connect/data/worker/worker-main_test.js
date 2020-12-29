var connect = require("can-connect");
var dataWorker = require("./worker");


connect([dataWorker, {
	getListData: function(){
		return Promise.resolve({data: [{id: 1},{id: 2}]});
	},

	updateListData: function(){},
	getSets: function(){},
	clear: function(){},

	getData: function(){
		return Promise.resolve({id: 3});
	},

	createData: function(){
		return Promise.resolve({id: 4, name: "createData"});
	},
	updateData: function(){
		return Promise.resolve({id: 5, name: "updateData"});
	},
	destroyData: function(){
		return Promise.resolve({id: 6, name: "destroyData"});
	}
}],{
	name: "todos"
});
