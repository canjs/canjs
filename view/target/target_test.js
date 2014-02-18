steal("can/view/target", function(target){
	
	
	module("can/view/target")
	
	test("basics", function(){
		
		// "<h1 class='foo {{#selected}}selected{{/selected}}' ><span>Hello {{message}}!</span></h1>"
		var classCallback = function( ){
			equal(this.nodeName.toLowerCase(), "h1", "class on the right element");
			this.className = "selected";
		},
			attributesCallback = function(){
				equal(this.nodeName.toLowerCase(), "h1", "attributes on the right element");
			},
			textNodeCallback = function( ){
				equal(this.nodeType, 3, "got a text node");
				this.nodeValue = "World"
			}
		
		
		
		var data = target([{
			tag: "h1",
			attrs: {
				"id" : "myh1",
				"class" : classCallback
			},
			attributes: [attributesCallback],
			children: [{
				tag: "span",
				children: [
					"Hello ",
					textNodeCallback,
					"!"
				]
			}]
		}]);
		
		
		
		equal( data.clone.childNodes.length, 1, "there is one child");
		
		var h1 = data.clone.childNodes[0]
		equal( h1.nodeName.toLowerCase(), "h1", "there is one h1");
		equal( h1.id, "myh1", "the h1 has the right id");
		
		equal( h1.childNodes.length, 1, "the h1 has span");
		
		
		
		
		deepEqual( data.paths, 
			[{
				path: [0],
				callbacks: [
					{ callback: classCallback, args: ["class"] },
					{ callback: attributesCallback }
				],
				paths: [{
					path: [0,1],
					callbacks: [
						{callback: textNodeCallback }
					]
				}]
			}] );
		
		var result = data.hydrate();
		
		var newH1 = result.childNodes[0];
		equal(newH1.className, "selected", "got selected class name");
		equal(newH1.innerHTML.toLowerCase(), "<span>hello world!</span>")
		
	})
})
