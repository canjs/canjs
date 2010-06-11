module("jquery/event/default")
test("namespaced with same function", function(){

	var count = 0 ,  func = function(){
		count++;
	}
	$("#qunit-test-area").html("<div id='one'>hey</div>")
	$("#one").bind("foo.bar", func).bind("foo.zar", func)
	$("#one").trigger("foo.bar")
	equals(1, count,"jquery seems ok")
})


test("triggering defaults", function(){

	$("#qunit-test-area").html("//jquery/event/default/test/qunit/html.micro",{})
	
	
	
	
	var count1 = 0, defaultNum, touchNum, num = 0;;
	$("#wrap1").bind("default.touch", function(){
		count1++;
		defaultNum = (++num)
	})
	$("#wrap1").bind("touch", function(){
		touchNum = (++num)
	})
	$("#touchme1").trigger("touch")
	equals(1, count1, "trigger default event")
	equals(1, touchNum, "default called second")
	equals(2, defaultNum, "default called second")
	
	
	
	//now prevent
	
	$("#bigwrapper").bind("touch", function(e){ e.preventDefault()})
	$("#touchme1").trigger("touch")
	equals(1, count1, "default event not called")
	equals(3, touchNum, "touch called again")
	
	var count2 = 0;
	$("#wrap2").bind("default.hide.me.a", function(){
		count2++;               
	})
	$(document.body).bind("hide", function(ev){
		if(ev.target.id == "clickme1"){
			console.log("stopping and preventing")
			ev.stopPropagation()
			ev.preventDefault()
		}
			
	})
	$(".clickme").click(function(){
		$(this).trigger("hide")
	})
	
	
	$("#qunit-test-area").html("")
})



test("live on default events", function(){
	
	$("#qunit-test-area").html("//jquery/event/default/test/qunit/html.micro",{})
	var bw = $("#bigwrapper"), 
		count1 = 0, 
		count2 = 0, 
		count3 = 0;
	var jq = $();
	jq.context = bw[0];
	jq.selector = "#wrap1"
	jq.live("default.touch", function(){
		count1++;
	});
	
	//2nd selector
	var jq2 = $();
	jq2.context = bw[0];
	jq2.selector = "#wrap2"
	jq2.live("default.touching", function(){
		count2++;
	});
	

	bw.delegate("#wrap2","default.somethingElse",function(){
		count3++;
	})
	
	
	$("#touchme1").trigger("touch")
	equals(count1,1,  "doing touch")
	
	$("#touchme2").trigger("touching")
	equals(count2,1,  "doing touching")
	
	$("#touchme2").trigger("somethingElse")
	equals(count3,1,  "delegated live somethingElse")
	
	
	$("#qunit-test-area").html("")
})
