(function() {
module('can/observe/compute')

test("Basic Compute",function(){
	
	var o = new can.Observe({first: "Justin", last: "Meyer"});
	var prop = can.compute(function(){
		return o.attr("first") + " " +o.attr("last")
	})
	
	equal(prop(), "Justin Meyer");
	var handler =  function(ev, newVal, oldVal){
		equal(newVal, "Brian Meyer")
		equal(oldVal, "Justin Meyer")	
	}
	prop.bind("change", handler);
	
	o.attr("first","Brian");
	
	prop.unbind("change", handler)
	o.attr("first","Brian");
});


test("compute on prototype", function(){
	
	var Person = can.Observe({
		fullName: function(){
			return this.attr("first") + " " +this.attr("last")
		}
	})
	
	var me = new Person({
		first : "Justin",
		last : "Meyer"
	});
	var fullName = can.compute( me.fullName, me );
	
	equal(fullName(), "Justin Meyer");
	
	var called = 0;
	
	fullName.bind("change", function( ev, newVal, oldVal ) {
		called++;
		equal(called, 1, "called only once");
		equal(newVal, "Justin Shah");
		equal(oldVal, "Justin Meyer")
	});
	
	me.attr('last',"Shah")
	
	// to make this work, we'd have to look for a computed function and bind to it's change ...
	// maybe bind can just work this way?
})


test("setter compute", function(){
	var project = new can.Observe({
		progress: 0.5
	});
	
	// a setter compute that converts 50 to .5 and vice versa
	var computed = can.compute(function(val){
		if(val) {
			project.attr('progress', val / 100)
		} else {
			return parseInt( project.attr('progress') * 100 );
		}
	});
	
	equal(computed(), 50, "the value is right");
	computed(25);
	equal(project.attr('progress'), 0.25);
	equal(computed(),25 );
	
	computed.bind("change", function(ev, newVal, oldVal){
		equal(newVal, 75);
		equal(oldVal, 25)
	})
	
	computed(75);
	
})

test("compute a compute", function() {
	var project = new can.Observe({
		progress: 0.5
	});

	var percent = can.compute(function(val){
		if(val) {
			project.attr('progress', val / 100);
		} else {
			return parseInt( project.attr('progress') * 100, 10);
		}
	});
	percent.named = "PERCENT";

	equal(percent(),50,'percent starts right');
	percent.bind('change',function() {
		// noop
	});

	var fraction = can.compute(function(val) {
		if(val) {
			percent(parseInt(val.split('/')[0],10));
		} else {
			return percent() + '/100';
		}
	});
	fraction.named ="FRACTIOn"

	fraction.bind('change',function() {
		// noop
	});

	equal(fraction(),'50/100','fraction starts right');

	percent(25);

	equal(percent(),25);
	equal(project.attr('progress'),0.25,'progress updated');
	equal(fraction(),'25/100','fraction updated');

	fraction('15/100');

	equal(fraction(),'15/100');
	equal(project.attr('progress'),0.15,'progress updated');
	equal(percent(),15,'% updated');
});

test("compute with a simple compute", function() {
	expect(4);
	var a = can.compute(5);
	var b = can.compute(function() {
		return a() * 2;
	});

	equal(b(),10,'b starts correct');
	a(3);
	equal(b(),6,'b updates');

	b.bind('change',function() {
		equal(b(),24,'b fires change');
	});
	a(12);
	equal(b(),24,'b updates when bound');
});


test("empty compute", function(){
	var c = can.compute();
	c.bind("change", function(ev, newVal, oldVal){
		ok(oldVal === undefined, "was undefined")
		ok(newVal === 0, "now zero")
	})
	
	c(0);
	
});

test("only one update on a batchTransaction",function(){
	var person = new can.Observe({first: "Justin", last: "Meyer"});
	var func = function(){
		return person.attr('first')+" "+person.attr('last')+Math.random()
	};
	var callbacks = 0;
	can.compute.binder(func, window, function(newVal, oldVal){
		callbacks++;
	});
	
	person.attr({
		first: "Brian",
		last: "Moschel"
	});
	
	equal(callbacks,1,"only one callback")
})

test("only one update on a start and end transaction",function(){
	var person = new can.Observe({first: "Justin", last: "Meyer"}),
		age = can.compute(5);
	var func = function(newVal,oldVal){
		return person.attr('first')+" "+person.attr('last')+age()+Math.random();
	};
	var callbacks = 0;
	can.compute.binder(func, window, function(newVal, oldVal){
		callbacks++;
	});
	
	can.Observe.startBatch();
	
	person.attr('first',"Brian");
	stop();
	setTimeout(function(){
		person.attr('last',"Moschel");
		age(12)
		
		can.Observe.stopBatch();
		
		equal(callbacks,1,"only one callback")
		
		start();
	})

	
	
})

test("Compute emits change events when an embbedded observe has properties added or removed", 4, function() {
	var obs = new can.Observe(),
		compute1 = can.compute(function(){
			var txt = obs.attr('foo');
			obs.each(function(val){
				txt += val.toString();
			});
			return txt;
		});

	compute1.bind('change', function(ev, newVal, oldVal) {
		ok(true, 'change handler fired: ' + newVal);
	})
	// we're binding on adding / removing and foo
	obs.attr('foo', 1);
	obs.attr('bar', 2);
	obs.attr('foo', 3);
	obs.removeAttr('bar');
	obs.removeAttr('bar');
});

test("compute only updates once when a list's contents are replaced",function(){
	
	var list = new can.Observe.List([{name: "Justin"}]),
		computedCount = 0;

	var compute = can.compute(function(){
		computedCount++;
		list.each(function(item){
			item.attr('name')
		})
	})
	equal(0,computedCount, "computes are not called until their value is read")
	compute.bind("change", function(ev, newVal, oldVal){
	
	})

	equal(1,computedCount, "binding computes to store the value");
	list.replace([{name: "hank"}]);
	equal(2,computedCount, "only one compute")

});

test("Generate computes from Observes with can.Observe.prototype.compute (#203)", 6, function() {
	var obs = new can.Observe({
		test : 'testvalue'
	});

	var compute = obs.compute('test');
	ok(compute.isComputed, '`test` is computed');
	equal(compute(), 'testvalue', 'Value is as expected');
	obs.attr('test', 'observeValue');
	equal(compute(), 'observeValue', 'Value is as expected');
	compute.bind('change', function(ev, newVal) {
		equal(newVal, 'computeValue', 'new value from compute');
	});
	obs.bind('change', function(ev, name, how, newVal) {
		equal(newVal, 'computeValue', 'Got new value from compute');
	});
	compute('computeValue');
	equal(compute(), 'computeValue', 'Got updated value');
});

test("compute of computes", function(){
	expect(2)
	var suggestedSearch = can.compute(null),
		searchQuery = can.compute(''),
		searchText = can.compute(function() {
			var suggested = suggestedSearch();
			if(suggested) {
				return suggested
			} else {
				return searchQuery();
			}
		});

	equal('',searchText(),"inital set");

	searchText.bind("change", function(ev, newVal){
		equal(newVal,"food", "food set");
	})
	
	
	searchQuery("food")
})


test("compute doesn't rebind and leak with 0 bindings", function() {
	var state = new can.Observe({
		foo: "bar"
	});
	var computedA = 0, computedB = 0;
	var computeA = can.compute(function() {
		computedA++;
		return state.attr("foo") === "bar";
	});
	var computeB = can.compute(function() {
		computedB++;
		return state.attr("foo") === "bar" || 15;
	});

	function aChange(ev, newVal) {
		if(newVal) {
			computeB.bind("change.computeA", function() {
				// noop
			});
		} else {
			computeB.unbind("change.computeA");
		}
	}

	computeA.bind("change", aChange);
	aChange(null, computeA());

	equal(computedA, 1, "binding A computes the value");
	equal(computedB, 1, "A=true, so B is bound, computing the value");

	state.attr("foo", "baz");
	equal(computedA, 2, "A recomputed and unbound B");
	equal(computedB, 1, "B was unbound, so not recomputed");

	state.attr("foo", "bar");
	equal(computedA, 3, "A recomputed => true");
	equal(computedB, 2, "A=true so B is rebound and recomputed");

	computeA.unbind("change", aChange);
	computeB.unbind("change.computeA");
	state.attr("foo", "baz");
	equal(computedA, 3, "unbound, so didn't recompute A");
	equal(computedB, 2, "unbound, so didn't recompute B");
});


test("compute setter without external value", function(){

	var age = can.compute(0,function(newVal, oldVal){
		var num = +newVal
	    if(! isNaN(num) && 0 <= num && num <= 120 ){
	        return num;
	    } else {
	    	return oldVal;
	    }
	})
	equal(age(), 0, "initial value set");
	age.bind("change", function(ev, newVal, oldVal){
		equal(5, newVal)
		age.unbind("change",arguments.callee)
	});

	age(5);
	equal(age(), 5, "5 set")

	age("invalid");
	equal(age(), 5, "5 kept")

})

test("compute value",function(){
	expect(9)
	var input = {
		value: 1
	}

	var value = can.compute("",{
		get: function(){
			return input.value;
		},
		set: function(newVal){
			input.value = newVal;
			//input.onchange && input.onchange();
		},
		on: function(update){
			input.onchange = update;
		},
		off: function(){
			delete input.onchange;
		}
	})

	equal(value(), 1, "original value");
	ok(!input.onchange, "nothing bound");
	value(2);

	equal(value(), 2, "updated value");

	equal(input.value, 2, "updated input.value");



	value.bind("change", function(ev, newVal, oldVal){
		equal(newVal, 3, "newVal");
		equal(oldVal, 2, "oldVal");
		value.unbind("change", arguments.callee);
	})
	ok(input.onchange, "binding to onchange");

	value(3);
	ok(!input.onchange, "removed binding")
	equal(value(), 3);
});

test("compute bound to observe",function(){
	var me = new can.Observe({name: "Justin"});

	var bind = me.bind,
		unbind = me.unbind,
		bindCount = 0;
	me.bind = function(){
		bindCount ++;
		bind.apply(this,arguments);
	}
	me.unbind = function(){
		bindCount --;
		unbind.apply(this,arguments);
	}

	var name = can.compute(me,"name")

	equal(bindCount, 0);
	equal(name(), "Justin");

	var handler = function(ev, newVal, oldVal){
		equal(newVal, "Justin Meyer");
		equal(oldVal, "Justin")
	}

	name.bind("change",handler)

	equal(bindCount, 1);

	name.unbind("change",handler);

	equal(bindCount, 0);
});

test("binding to a compute on an observe before reading",function(){
	var me = new can.Observe({name: "Justin"});

	var name = can.compute(me,"name")

	
	var handler = function(ev, newVal, oldVal){
		equal(newVal, "Justin Meyer");
		equal(oldVal, "Justin")
	}

	name.bind("change",handler)

	equal(name(), "Justin");
})

test("compute bound to input value",function(){
	var input = document.createElement('input');
	input.value = 'Justin';

	var value = can.compute(input, "value","change")

	equal(value(),"Justin");

	value("Justin M.");

	equal(input.value,"Justin M.","input change correctly");


	var handler = function(ev, newVal, oldVal){
		equal(newVal, "Justin Meyer");
		equal(oldVal, "Justin M.")
	}

	value.bind("change", handler);


	input.value = "Justin Meyer";

	value.unbind("change", handler);

	input.value = "Brian Moschel";

	equal(value(),"Brian Moschel");

})

test("compute reads without observe", function() {
	var oldObserve = can.Observe;
	delete can.Observe;

	var comp = can.compute(5);

	equal(comp(), 5, "Got compute value");

	can.Observe = oldObserve;
})

})();
