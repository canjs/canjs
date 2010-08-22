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
})
