steal("can/view/stash", function(stash){
	
	
	module("can/view/stash")
	
	test("html to html", function(){
		
		var stashed = stash("<h1 class='foo'><span>Hello World!</span></h1>")
		
		
		var frag = stashed();
		equal(frag.childNodes[0].innerHTML, "<span>Hello World!</span>","got back the right text");
	})
	
	
	test("basic replacement", function(){
		
		var stashed = stash("<h1 class='foo'><span>Hello {{message}}!</span></h1>")
		
		
		var frag = stashed({
			message: "World"
		});
		equal(frag.childNodes[0].innerHTML, "<span>Hello World!</span>","got back the right text");
	})
	
	
	test("a section helper", function(){
		
		
		stash.registerHelper("helper", function(options){
			
			return options.fn({message: "World"})
			
		})
		
		var stashed = stash("<h1 class='foo'>{{#helper}}<span>Hello {{message}}!</span>{{/helper}}</h1>")
		
		
		var frag = stashed({});
		equal(frag.childNodes[0].innerHTML, "<span>Hello World!</span>","got back the right text");
		
	});
	
	test("attribute sections", function(){
		var stashed = stash("<h1 style='top: {{top}}px; left: {{left}}px; background: rgb(0,0,{{color}});'>Hi</h1>");
		
		var frag = stashed({
			top: 1,
			left: 2,
			color: 3
		})
		
		equal(frag.childNodes[0].style.top, "1px", "top works");
		equal(frag.childNodes[0].style.left, "2px", "left works");
		equal(frag.childNodes[0].style.backgroundColor.replace(/\s/g,""), "rgb(0,0,3)", "color works");
	})
	
	
	test("boxes example", function(){
		
		var boxes = [],
			Box = can.Map.extend({
				count: 0,
				content: 0,
				top: 0,
				left: 0,
				color: 0,
				tick: function () {
					var count = this.attr("count") + 1;
					this.attr({
						count: count,
						left: Math.cos(count / 10) * 10,
						top: Math.sin(count / 10) * 10,
						color: count % 255,
						content: count
					});
				}
			});

		for (var i = 0; i < 1; i++) {
			boxes.push(new Box({
				number: i
			}));
		}
		
		var stashed = stash("{{#each boxes}}"+
				"<div class='box-view'>"+
					"<div class='box' id='box-{{number}}'  style='top: {{top}}px; left: {{left}}px; background: rgb(0,0,{{color}});'>"+
						"{{content}}"+
					"</div>"+
				"</div>"+
			"{{/each}}");
		
		var frag = stashed({
			boxes: boxes
		})
		
		//equal(frag.children.length, 2, "there are 2 childNodes");
		
		equal(frag.children[0].childNodes[0].style.top, "0px")
		
		boxes[0].tick();
		
		ok(frag.children[0].childNodes[0].style.top != "0px");
		
	})
	
	
	
})
