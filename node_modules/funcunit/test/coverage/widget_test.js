module("funcunit-open")

test('Check init', function() {
	F.open('//funcunit/test/coverage/widget.html');
	F('.next a').text('Next', "Next is good")
	F('.prev a').text('Prev', "Prev is good")
	F('.current').text('1', "Value is good")
});

test('Increment', function() {
	F.open('//funcunit/test/coverage/widget.html');
	F('.next a').click();
	F('.current').text('2', "Value is good")
});

test('Decrement', function() {
	F.open('//funcunit/test/coverage/widget.html');
	F('.next a').click();
	F('.prev a').click();
	F('.current').text('1', "Value is good")
});

test('Decrement and underflow', function() {
	F.open('//funcunit/test/coverage/widget.html');
	F('.prev a').click();
	F('.current').text('10', "Value is good")
});

test('Increment to overflow', function() {
	F.open('//funcunit/test/coverage/widget.html');
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.next a').click();
	F('.current').text('1', "Value is good")
});