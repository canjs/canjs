steal('can/view/live.js',
	'can/observe/compute',
	'can/observe',
	'funcunit/qunit',
	function(live, compute, Observe){

	module("can/view/live");

	test("html", function(){

		var div = document.createElement('div'),
			span = document.createElement('span');

		div.appendChild(span)
		
		var items = new can.Observe.List(['one','two']);

		var html = compute(function(){
			var html = "";
			items.each(function(item){
				html += "<label>"+item+"</label>"
			})
			return html;
		}) 

		live.html(span,html, div)

		equal(div.getElementsByTagName('label').length, 2);

		items.push('three')

		equal(div.getElementsByTagName('label').length, 3);

	});

	var esc = function(str){
		return str.replace(/</g,"&lt;").replace(/>/g,"&gt;")
	}

	test("text", function(){
		var div = document.createElement('div'),
			span = document.createElement('span');

		div.appendChild(span)
		
		var items = new can.Observe.List(['one','two']);

		var text = compute(function(){
			var html = "";
			items.each(function(item){
				html += "<label>"+item+"</label>"
			})
			return html;
		}) 

		live.text(span,text, div)

		equal(div.innerHTML, esc( "<label>one</label><label>two</label>"));

		items.push('three')

		equal(div.innerHTML, esc("<label>one</label><label>two</label><label>three</label>"));
	});

	test("attributes",function(){

		var div = document.createElement('div');
		
		var items = new can.Observe.List(['class','foo']);

		var text = compute(function(){
			var html = "";
			if(items.attr(0) && items.attr(1)){
				html += items.attr(0)+"='"+items.attr(1)+"'"
			}
			return html;
		}) 

		live.attributes(div,text)

		equal(div.className, 'foo');

		items.splice(0,2);

		equal(div.className, '');

		items.push("foo","bar");

		equal(div.getAttribute('foo'), 'bar');

	})

	test("attribute", function(){

		var div = document.createElement('div');
		div.className = "foo "+live.attributePlaceholder+" "+live.attributePlaceholder+" end";

		var firstObject = new can.Observe({});

		var first = compute(function(){
			return firstObject.attr('selected') ? "selected" : ""
		})

		var secondObject = new can.Observe({});

		var second = compute(function(){
			return secondObject.attr('active') ? "active" : ""
		});

		live.attribute(div, "class", first);

		live.attribute(div, "class", second);

		equal(div.className, "foo   end");

		firstObject.attr("selected",true);

		equal(div.className, "foo selected  end");

		secondObject.attr("active",true);

		equal(div.className, "foo selected active end");

		firstObject.attr("selected",false);

		equal(div.className, "foo  active end");
	})


	test("list", function(){

		var div = document.createElement('div'),
			list = new can.Observe.List(['sloth', 'bear']),
			template = function(animal){
				return "<label>Animal=</label> <span>"+animal+"</span>"
			}

		div.innerHTML = "my <b>fav</b> animals: <span></span> !"
		var el = div.getElementsByTagName('span')[0];

		live.list(el, list, template,{});

		equal(div.getElementsByTagName('label').length, 2, "There are 2 labels")
		div.getElementsByTagName('label')[0].myexpando = "EXPANDO-ED";

		list.push("turtle")

		equal(div.getElementsByTagName('label')[0].myexpando, "EXPANDO-ED", "same expando");

		equal(div.getElementsByTagName('span')[2].innerHTML, "turtle", "turtle added");

	})

})