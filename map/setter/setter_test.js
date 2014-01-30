/*global School*/
steal("can/map/setter", "can/test", function() {
	module('can/map/setter');
	test('setter testing works', function () {
		var Contact = can.Map({
			setBirthday: function (raw) {
				if (typeof raw === 'number') {
					return new Date(raw);
				} else if (raw instanceof Date) {
					return raw;
				}
			}
		});
		var date = new Date(),
			contact = new Contact({
				birthday: date.getTime()
			});
		// set via constructor
		equal(contact.birthday.getTime(), date.getTime(), 'set as birthday');
		// set via attr method
		date = new Date();
		contact.attr('birthday', date.getTime());
		equal(contact.birthday.getTime(), date.getTime(), 'set via attr');
		// set via attr method w/ multiple attrs
		date = new Date();
		contact.attr({
			birthday: date.getTime()
		});
		equal(contact.birthday.getTime(), date.getTime(), 'set as birthday');
	});
	test('error binding', 1, function () {
		can.Map('School', {
			setName: function (name, success, error) {
				if (!name) {
					error('no name');
				}
				return error;
			}
		});
		var school = new School();
		school.bind('error', function (ev, attr, error) {
			equal(error, 'no name', 'error message provided');
		});
		school.attr('name', '');
	});
	test('asyncronous setting', function () {
		var Meyer = can.Map({
			setName: function (newVal, success) {
				setTimeout(function () {
					success(newVal + ' Meyer');
				}, 1);
			}
		});
		stop();
		var me = new Meyer();
		me.bind('name', function (ev, newVal) {
			equal(newVal, 'Justin Meyer');
			equal(me.attr('name'), 'Justin Meyer');
			start();
		});
		me.attr('name', 'Justin');
	});
});
