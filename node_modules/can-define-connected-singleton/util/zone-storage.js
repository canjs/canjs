module.exports = {
	data: {},

	getStore: function () {
		if (window.doneSsr) {
			var CanZone = window.CanZone || undefined;
			return typeof CanZone === 'undefined' ? this.data : CanZone.current.data;
		}
		return this.data;
	},

	setItem: function (prop, value) {
		var store = this.getStore();
		store[prop] = value;
	},

	getItem: function (prop) {
		var store = this.getStore();
		return store[prop];
	},

	removeItem: function (prop) {
		var store = this.getStore();
		delete store[prop];
	}
};
