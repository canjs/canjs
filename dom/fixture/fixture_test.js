steal
 .plugins("jquery/dom/fixture")  //load your app
 .plugins('funcunit/qunit').then(function(){

module("jquery/dom/fixture");

test("static fixtures", function(){
	stop();
	$.get("something",function(data){
		equals(data.sweet,"ness","$.get works");
		$.post("something",function(data){
			
			equals(data.sweet,"ness","$.post works");
			
			$.ajax({
				url: "something",
				dataType: "json",
				success: function( data ) {
					equals(data.sweet,"ness","$.ajax works");
					start();
				},
				fixture: "//jquery/dom/fixture/fixtures/test.json"
			})
			
		},"json","//jquery/dom/fixture/fixtures/test.json");
	},'json',"//jquery/dom/fixture/fixtures/test.json");
})

test("dynamic fixtures",function(){
	stop();
	$.fixture.delay = 10;
	var fix = function(){
		return [{sweet: "ness"}]
	}
	$.get("something",function(data){
		equals(data.sweet,"ness","$.get works");
		$.post("something",function(data){
			
			equals(data.sweet,"ness","$.post works");
			
			$.ajax({
				url: "something",
				dataType: "json",
				success: function( data ) {
					equals(data.sweet,"ness","$.ajax works");
					start();
				},
				fixture: fix
			})
			
		},"json",fix);
	},'json',fix);
});

test("fixture function", function(){
	
	stop();
	var url = steal.root.join("jquery/dom/fixture/fixtures/foo.json");
	$.fixture(url,"//jquery/dom/fixture/fixtures/foobar.json" );
	
	$.get(url,function(data){
		equals(data.sweet,"ner","url passed works");
		
		$.fixture(url,null );
		
		$.get(url,function(data){ 
		
			equals(data.a,"b","removed");
			start();
			
		},'json')
		
		
		
	},"json");

});

});
