module('tabs', {
	setup: function() {
		F.open('tabs.html');
	}
});

test('single tab click', function() {
	F('li:contains("Fallout")').click();
	F('#starcraft').invisible('tab should be hidden');
	F('#fallout').visible('tab should be shown');
});

test('clicking one tab then another', function() {
	F('li:contains("Fallout")').click();
	F('#fallout').visible('tab should be shown');

	F('li:contains("Robot Unicorn Attack")').click();
	F('#fallout').invisible('tab should be hidden');
	F('#rua').visible('tab should be shown');
});