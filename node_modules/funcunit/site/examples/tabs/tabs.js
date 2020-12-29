$.fn.tabs = function() {
	var lis = this.find('li:nth-child(n+2)');
	lis.each(function(i, li) {
		var href = $(li).children().attr('href');
		$(href).hide();
	});

	this.find('li').bind('click', function() {
		var href = $(this).children().attr('href');
		$('div').hide();
		$(href).show();
	});
};