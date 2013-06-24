(function(){
	
	module("can/observe/lazy")

	test("Basics", 5, function() {
		var person = new can.LazyMap({
			name: {
				first: "Justin",
				last: "Meyer",
				facts: [
					{id: 1, description: "Middle names get passed down"},
					{id: 2, description: "JBM"}
				]
			},
			age: 30
		});

		// convert nested object to LazyMap
		var firstFact = person.attr("name.facts.0");

		// check lazy conversion on .attr()
		ok(person.name.facts[0] instanceof can.LazyMap, "Nested attribute converted to LazyMap");

		// listen changes on parent, checks bubbling
		person.bind("change", function(ev, attr, how, newVal, oldVal) {
			equal(attr, "name.facts.0.description", "Parent triggers on nested LazyMap update - correct attr");
			equal(newVal, "Boom", "Parent triggers on nested LazyMap update - correct new value");
		});

		// listen changes on nested element
		firstFact.bind("change", function(ev, attr, how, newVal, oldVal) {
			equal(attr, "description", "Nested LazyMap triggers on change - correct attr");
			equal(newVal, "Boom", "Nested LazyMap triggers on change - correct new value");
		});
		
		// update nested LazyMap
		firstFact.attr("description", "Boom");
	});
	
	test("Check 'rewiring' after converting in-the-middle object", 4, function() {
		var person = new can.LazyMap({
			name: {
				first: "Justin",
				last: "Meyer",
				facts: [
					{id: 1, description: "Middle names get passed down"},
					{id: 2, description: "JBM"}
				]
			},
			age: 30
		});

		// convert an nested object to LazyMap
		var firstFact = person.attr("name.facts.0"),

			// convert in-the-middle object to LazyMap, 'rewiring' occures
			name = person.attr("name"),
			count1 = 0, count2 = 0;

		// listen changes on in-the-middle LazyMap
		name.bind("change",function(ev, attr, how, newVal, oldVal){
			equal(attr, "facts.0.description", "In-the-middle LazyMap trigger on child update - correct attr")
			equal(newVal, "Boom", "In-the-middle LazyMap trigger on child update - correct value")
		});

		// listen changes on parent, checks bubbling
		person.bind("change", function(ev, attr, how, newVal, oldVal) {
			equal(attr, "name.facts.0.description", "Parent triggers on nested LazyMap update - correct attr");
			equal(newVal, "Boom", "Parent triggers on nested LazyMap update - correct new value");
		});

		// trigger by changing attribute in nested LazyMap
		firstFact.attr("description", "Boom")
	});


	test("Setting an attribute", 1, function(){
		var person = new can.LazyMap({});
		
		person.bind("change",function(ev, attr, how, newVal){
			ok(newVal instanceof can.LazyMap, "Setting (new) attribute converts it into LazyMap")
		})
		
		person.attr("name",{
			first: "Justin"
		})		
	})

	test("Internal array reordering", 7, function(){

		var ll = new can.LazyMap({
			id: 1,
			items: [
				{id: "1.0"},
				{id: "1.1"}
			]
		}),	
			onePointOne = ll.attr('items.1'),
			count = 0;

		ll.bind("change",function(ev, attr, how, newVal, oldVal){
			count++;
			if( count == 1 ){
				equal(attr, "items.1.name", "Second element in list gets the attribute")
				equal(newVal, "A", "Second element in list gets the right value")
			} else if( count == 2 ){
				equal(attr, "items.0", "First element is removed from array - correct attr")
				equal(how, "remove", "First element is removed from array - correct how")
				ok(oldVal[0] instanceof can.LazyMap, "Removed element is an instance of LazyMap")
			} else if( count == 3 ){
				equal(attr, "items.0.name", "After reordering right element gets updated - correct attr")
				equal(newVal, "B", "After reordering right element gets updated - correct newVal")
			}
		});

		// trigger change on 1.1, it's second element in the array
		onePointOne.attr("name", "A");
		
		// this is evil / dangerous
		// the problem is that it messes up the indexes of 1.items.1. 
		// removeAttr can't do it's business
		ll.removeAttr('items.0');
		// when 0 is removed, it should re-adjust everything else ...
		// *1*.items.*0*.name
		// *1*.items.*1*.name

		// trigger change on 1.1 again, but now it's first element in the array
		onePointOne.attr("name", "B");
	})

	test("Changing an object unbinds", 4, function(){
		var state = new can.LazyMap({
			category : 5,
			productType : 4,
			properties : {
				brand: [],
				model : [],
				price : []
			}
		}),
			count = 0;

		// converts to LazyList
		var brand = state.attr("properties.brand");

		state.bind("change", function(ev, attr, how, val, old){
			equals(attr, "properties.brand", "Right attribute changed.");
			equals(count, 0, "Called only once!");
			count++;
			equals(how, "set", "Right method used.")
			equals(val[0], "hi", "Right value set.")
		});
		 
		// replace previous LazyList with a new one
		state.attr("properties.brand", ["hi"]);

		// this shouldn't trigger 'change' any more
		brand.push(1,2,3);
	});

	test("Replacing with an object that object becomes observable", 2, function(){
		var state = new can.LazyMap({
			properties : {
				brand: [],
				model : [],
				price : []
			}
		});
		
		ok(state.attr("properties").bind, "Has bind function.");
		state.attr("properties",{});		
		ok(state.attr("properties").bind, "After replacement still has bind function.");
	});

	test(".attr does not blow away old observable", 2, function(){
		var state = new can.LazyMap({
			properties : {
				brand: ['gain'],
				foo: {bar: 'baz'}				
			},
			others: {}
		});
		
		var oldCid = state.attr("properties.brand")._cid;

		state.attr({properties: {brand: [], foo: 'barbaz'}}, true);
		
		same(state.attr("properties.brand")._cid, oldCid, "Should be the same observe, so that views bound to the old one get updates.")
		equals(state.attr("properties.brand").length, 0, "List should be empty.");
		 
	});

	test("Sub observes respect attr 'remove' parameter", function() {
		var bindCalled = 0,
			state = new can.LazyMap({
				monkey : {
					tail: 'brain'
				}
			});

		state.bind("change", function(ev, attr, how, newVal, old){
			bindCalled++;
			equals(attr, "monkey.tail");
			equals(old, "brain");
			equals(how, "remove");
		});

		state.attr({monkey: {}});
		
		equals("brain", state.attr("monkey.tail"), "Should not remove attribute of sub observe when remove param is false.");
		equals(0, bindCalled, "Remove event not fired for sub observe when remove param is false.");

		state.attr({monkey: {}}, true);

		equals(undefined, state.attr("monkey.tail"), "Should remove attribute of sub observe when remove param is false.");
		equals(1, bindCalled, "Remove event fired for sub observe when remove param is false.");
	});

	// TODO: check nested references
	test("Remove attr", 4, function(){
		var state = new can.LazyMap({
			properties : {
				brand: [],
				model : [],
				price : []
			}
		});
		
		state.bind("change", function(ev, attr, how, newVal, oldVal){
			equals(attr, "properties", "Right attribute removed ...");
			equals(how, "remove", "... with right method")
			same(oldVal.serialize() ,{
				brand: [],
				model : [],
				price : []
			}, "... and right old value." );
		})
		
		state.removeAttr("properties");
		
		equals(undefined,  state.attr("properties"), "Attribute is removed." );
	});

	// TODO: check nested references
	test("Remove nested attr", 4, function(){
		var state = new can.LazyMap({
			properties : {
				nested: true
			}
		});
		
		state.bind("change", function(ev, attr, how, newVal, old){
			equals(attr, "properties.nested", "Right attribute removed ...");
			equals(how, "remove", "... with right method")
			same(old , true, "... and right old value.");
		})
		
		state.removeAttr("properties.nested");
		equals(undefined,  state.attr("properties.nested"), "Removed attribute isn't accessable after removal.");
	});

	test("Remove item in nested array", 4, function(){
		var state = new can.LazyMap({
			array : ["a", "b"]
		});
		
		state.bind("change", function(ev, attr, how, newVal, old){
			equals(attr, "array.1", "Right item removed ...");
			equals(how, "remove", "... with right method")
			same(old, ["b"], "... and right old value.");
		})
		
		state.removeAttr("array.1");
		equals(undefined,  state.attr("array.1"), "Removed item isn't accessable." );
	});

	test("Remove nested property in item of array", 4, function(){
		var state = new can.LazyMap({
			array : [{
				nested: true
			}]
		});
		
		state.bind("change", function(ev, attr, how, newVal, old){
			equals(attr, "array.0.nested", "Right property removed");
			equals(how, "remove", "... with right method")
			same(old, true, "... and right old value.");
		})

		state.removeAttr("array.0.nested");
		equals(undefined,  state.attr("array.0.nested"), "Removed prop is not accessable.");
	});

	test("Remove nested property in item of array observe", function(){
		var state = new can.LazyList([{nested: true}]);
		
		state.bind("change", function(ev, attr, how, newVal, old){
			equals(attr, "0.nested", "Right attribute removed");
			equals(how, "remove", "... with right method")
			same(old, true, "... and right old value");
		})

		state.removeAttr("0.nested");
		equals(undefined, state.attr("0.nested"), "Removed prop is not accessable.");
	});

	test("Attr with an object", 5, function(){
		var state = new can.LazyMap({
			properties : {
				foo: "bar",
				brand: []
			}
		});
		
		state.bind("change", function(ev, attr, how, newVal){
			equals(attr, "properties.foo")
			equals(newVal, "bad")
		})
		
		state.attr({
			properties : {
				foo: "bar",
				brand: []
			}
		})
		
		state.attr({
			properties : {
				foo: "bad",
				brand: []
			}
		});
		
		state.unbind("change");
		
		state.bind("change", function(ev, attr, how, newVal){
			equals(attr, "properties.brand.0")
			equals(how,"add")
			same(newVal, ["bad"])
		});
		
		state.attr({
			properties : {
				foo: "bad",
				brand: ["bad"]
			}
		});		
	});

	test("Empty get", 1, function(){
		var state = new can.LazyMap({});
		
		equals(state.attr('foo.bar'), undefined, "Returns undefined.")
	});

	test("Attr deep array ", 1, function(){
		var state = new can.LazyMap({});
		var arr = [{ foo: "bar" }],
			thing = { arr: arr };
		
		state.attr({ thing: thing }, true);
		ok(thing.arr === arr, "Thing unmolested");
	});

	test('Attr semi-serialize', function(){
		var first = {
			foo : {bar: 'car'},
			arr: [1,2,3, {four: '5'}]
		},
			compare = {
				foo : {bar: 'car'},
				arr: [1,2,3, {four: '5'}]
			};
		
		var res = new can.LazyMap(first).attr();
		same(res, compare, "Serialized result matches.")
	})

	/* fails with can.Observe as well?!
	test("Attr sends events after it is done", 2, function(){
		var state = new can.LazyMap({foo: 1, bar: 2});
		
		state.bind('change', function(){
			equals(state.attr('foo'), -1, "attr 'foo' set with right value");
			equals(state.attr('bar'), -2, "attr 'bar' set with right value")
		})

		state.attr({foo: -1, bar: -2});
	})
	 */
	 
	// Do we need direct prop access on LazyMap ?!
	test("Direct property access", 2, function(){
		var state = new can.LazyMap({foo: 1, attr: 2});
		
		equals(state.foo, 1, "Right value on direct access");
		equals(typeof state.attr, 'function', "'.attr' exists.")
	})

	// TODO: check `oldVal`, doesn't return oldVal in can.Observe.List as well
	test("Pop unbinds", 6, function(){
		var l = new can.LazyList( [{foo: 'bar'}] );
		var o = l.attr(0),
			count = 0;
		
		l.bind('change', function(ev, attr, how, newVal, oldVal){
			count++;
			if(count == 1){
				// the prop change
				equals(attr, '0.foo', "Right attr is changed");
				equals(how, 'set', "... with right method");
				equals(newVal, 'car', "... and right value.");
			} else if(count === 2 ){
				equals(attr, "0", "Right item is poped");
				equals(how, "remove", "... with right method");
				//equals(oldVal, "", "... and right old value.");
			} else {
				ok(false, "called too many times")
			}
			
		})
		
		equals( o.attr('foo') , 'bar', "Right attr value.");
		
		o.attr('foo', 'car')
		l.pop();
		o.attr('foo', 'bad') // shouldn't trigger 'change' any more
	})
	
	test("Splice unbinds", 6, function(){
		var l = new can.Observe.List([{foo: 'bar'}]);
		var o = l.attr(0),
			count = 0;

		l.bind('change', function(ev, attr, how, newVal, oldVal){
			count++;
			if(count == 1){
				// the prop change
				equals(attr, '0.foo', "Right attr is changed");
				equals(how, 'set', "... with right method");
				equals(newVal, 'car', "... and right value.");
			} else if(count === 2 ){
				equals(attr, "0", "Right item is poped");
				equals(how, "remove", "... with right method");
				//equals(oldVal, "", "... and right old value.");
			} else {
				ok(false, "called too many times")
			}
			
		})
		
		equals( o.attr('foo') , 'bar', "Right attr value.");
		
		o.attr('foo', 'car')
		l.splice(0, 1);
		o.attr('foo', 'bad') // shouldn't trigger 'change' any more
	});

	test("Always gets right attr even after moving array items", 4, function(){
		var l = new can.LazyList([{foo: 'bar'}]);
		
		// get the first item
		var o = l.attr(0);

		// add a new item
		l.unshift("A new Value")
		
		// listen to change
		l.bind('change', function(ev, attr, how, newVal, oldVal){
			equals(attr, "1.foo", "Right attribute")
			equals(how, "set", "Right method")
			equals(newVal, "led you", "Right old value")
			equals(oldVal, "bar", "Right new value")
		})
		
		// this should have bubbled right
		o.attr('foo', 'led you')
	})

	/* Fails for some reason
	test("recursive observers do not cause stack overflow", function() {
		var a = new can.LazyMap();
		var b = new can.LazyMap({a: a});
		a.attr("b", b);
	});
	 */

	test("Bind to specific attribute changes when an existing attribute's value is changed", 2, function() {
		var paginate = new can.LazyMap( { offset: 100, limit: 100, count: 2000 } );

		paginate.bind( 'offset', function( ev, newVal, oldVal ) {
			equals(newVal, 200, "Right new value");
			equals(oldVal, 100, "Right old value");
		});

		paginate.attr( 'offset', 200 );
	});

	test("Bind to specific attribute changes when an attribute is removed", 2, function() {
		var paginate = new can.LazyMap( { offset: 100, limit: 100, count: 2000 } );

		paginate.bind( 'offset', function( ev, newVal, oldVal ) {
			equals(newVal, undefined, "Right new value");
			equals(oldVal, 100, "Right old value");
		});

		paginate.removeAttr( 'offset' );
	});


	/*
	test("Instantiating can.Observe.List of correct type", function() {
		var Ob = can.Observe({
			getName : function() {
				return this.attr('name');
			}
		});

		var list = new Ob.List([{
			name : 'Tester'
		}]);

		equal(list.length, 1, 'List length is correct');
		ok(list[0] instanceof can.Observe, 'Initialized list item converted to can.Observe');
		ok(list[0] instanceof Ob, 'Initialized list item converted to Ob');
		equal(list[0].getName(), 'Tester', 'Converted to extended Observe instance, could call getName()');
		list.push({
			name : 'Another test'
		});
		equal(list[1].getName(), 'Another test', 'Pushed item gets converted as well');
	});
	 */
	
	/*
	test("can.Observe.List.prototype.splice converts objects (#253)", function() {
		var Ob = can.Observe({
			getAge : function() {
				return this.attr('age') + 10;
			}
		});

		var list = new Ob.List([ {
			name: 'Tester',
			age: 23
		}, {
			name: 'Tester 2',
			age: 44
		}]);

		equal(list[0].getAge(), 33, 'Converted age');

		list.splice(1, 1, {
			name: 'Spliced',
			age: 92
		});

		equal(list[1].getAge(), 102, 'Converted age of spliced');
	});
	 */

	/* 
	test("Removing an already missing attribute does not cause an event", function(){
		var lm = new can.LazyMap({});
	 
		lm.bind("change", function(){
			ok(false)
		})
		lm.removeAttr("foo")
	});
	 */
	 
	test("Only plain objects should be converted to Observes", function() {
		var lm = new can.LazyMap({});

		lm.attr('date', new Date());
		ok(lm.attr('date') instanceof Date, 'Date should not be converted');
		
		var selected = can.$('body');
		lm.attr('sel', selected);
		if( can.isArray(selected) ) {
			ok(lm.attr('sel')  instanceof can.LazyList, 'can.$() as array converted into LazyList');
		} else {
			equal(lm.attr('sel'), selected, 'can.$() should not be converted');
		}

		lm.attr('element', document.getElementsByTagName('body')[0]);
		equal(lm.attr('element'), document.getElementsByTagName('body')[0], 'HTMLElement should not be converted');

		lm.attr('window', window);
		equal(lm.attr('window'), window, 'Window object should not be converted');		
	});
	
	test("startBatch and stopBatch and changed event", 5, function(){
		
		var ob = new can.LazyMap({name: {first: "Brian"}, age: 29}),
			bothSet = false,
			changeCallCount = 0,
			changedCalled = false;
		
		ob.bind("change", function(){
			ok(bothSet, "both properties are set before the changed event was called")
			ok(!changedCalled, "changed not called yet")
			changeCallCount++;
		})
		// The following tests how changed events should fire
		/*ob.bind("changed", function(ev, attrs){
		 equal(changeCallCount, 2, "two change events")
		 
		 equal(attrs.length, 2, "changed events include bubbling change events");
		 changedCalled = true;
		 })*/
		stop();
		can.Observe.startBatch(function(){
			ok(true, "batch callback called")
		});
		
		ob.attr('name.first','Justin')
		setTimeout(function(){
			ob.attr('age',30);
			bothSet = true;
			can.Observe.stopBatch();
			start();
		},1)
	});
	
	test("startBatch callback", 4, function(){
		var lm = new can.LazyMap({game: {name: "Legend of Zelda"}, hearts: 15 }),
			callbackCalled = false;
		
		lm.bind("change", function(){
			equals(callbackCalled, false, "startBatch callback not called yet");
		});

		can.Observe.startBatch(function(){
			ok(true, "startBatch callback called");
			callbackCalled = true;
		});
		
		lm.attr('hearts', 16);
		equals(callbackCalled, false, "startBatch callback not called yet");
		can.Observe.stopBatch();
		equals(callbackCalled, true, "startBatch callback called");
	});

	test("Chaning nested LazyMap prop to same value triggers only once", 4, function() {
		var person1 = new can.LazyMap( { name: {first: 'Josh' } } ),
			person2 = new can.LazyMap( { name: {first: 'Justin', last: 'Meyer' } } ),
			count = 0;

		person1.bind("change", function(ev, attr, how, newVal, oldVal){
			equals(count, 0, "Change called once.")
			count++;
			equals(attr, 'name', "... with right attr");
			equals(newVal.attr('first'), 'Justin', "... with right value");
			equals(newVal.attr('last'), 'Meyer', "... with right value");
		})

		person1.attr('name', person2.attr('name'));

		// Attempt to set the name attribute again, should not cause any triggers
		person1.attr('name', person2.attr('name'));
	});

	test("Nested array conversion (#172)", 4, function() {
		var original = [ [1, 2], [3, 4], [5, 6] ],
			list = new can.LazyList(original);

		equal(list.length, 3, "Observe list length is correct");
		deepEqual(list.serialize(), original, "Lists are the same");
		list.unshift([10, 11], [12, 13]);
		ok(list[0] instanceof can.LazyList, "Unshifted array converted to observe list");

		deepEqual(list.serialize(), [[10, 11], [12, 13]].concat(original), "Arrays unshifted properly");
	});

	test("can.Observe.List.prototype.replace (#194)", 7, function() {
		var list = new can.LazyList(['a', 'b', 'c']),
			replaceList = ['d', 'e', 'f', 'g'],
			dfd = new can.Deferred();

		list.bind('remove', function(ev, arr) {
			equal(arr.length, 3, 'Three elements removed');
		});

		list.bind('add', function(ev, arr) {
			equal(arr.length, 4, 'Four new elements added');
		});

		list.replace(replaceList);

		deepEqual(list.serialize(), replaceList, 'Lists are the same');

		list.unbind('remove');
		list.unbind('add');

		list.replace();
		equal(list.length, 0, 'List has been emptied');
		list.push('D');

		stop();
		list.replace(dfd);
		setTimeout(function() {
			var newList = ['x', 'y'];

			list.bind('remove', function(ev, arr) {
				equal(arr.length, 1, 'One element removed');
			});

			list.bind('add', function(ev, arr) {
				equal(arr.length, 2, 'Two new elements added from Deferred');
			});

			dfd.resolve(newList);

			deepEqual(list.serialize(), newList, 'Lists are the same');

			start();
		}, 100);
	});

	test("Replace with a deferred that resolves to an Observe.List", 4, function(){
		stop();
		
		var def = new can.Deferred();
		def.resolve(new can.LazyList([{name: "foo"},{name: "bar"}]));
		var list = new can.LazyList([{name: "1"},{name: "2"}]);
		
		list.bind("change",function(){
			start();
			
			equal(list.length, 2, "length is still 2");
			equal(list[0].attr("name"),"foo", "set to foo")
		})
		
		list.replace(def);
	});

	test(".attr method doesn't merge nested objects (#207)", 1, function() {
		// From http://jsfiddle.net/andrewborovin/wsNZB/
		var test = new can.LazyMap({
			a: {
				a1: 1,
				a2: 2
			},
			b: {
				b1: 1,
				b2: 2
			}
		});

		var result = {a: {a1: 1, a2: 3}, b: {b1: 3, b2: 2 }}

		test.attr({
			a: {
				a2: 3
			},
			b: {
				b1: 3
			}
		});

		deepEqual(test.attr(), result, "Object merged as expected");
	});
	
	test("IE8 error on list setup with Observe.List (#226)", 1, function() {
		var list = new can.LazyList(['first', 'second', 'third']),
			otherList = new can.LazyList(list);

		deepEqual(list.attr(), otherList.attr(), "Lists are the same");
	});
	
	test("Initialize Observe.List with a deferred",function(){
		stop()
		
		var def = new can.Deferred();
		var list = new can.LazyList(def);
		
		list.bind("add",function(ev, items, index){
			same(items,["a","b"]);
			equal(index, 0);
			start();
		});
		
		setTimeout(function(){
			def.resolve(["a","b"])
		},10)
	});
	
	test("Triggering a event while in a batch (#291)", function(){
		// normally a change event will not be triggered just
		// by changing properties. 
		// however, model does this in  destroyed
		// so a "change","destroyed" event bubbles.
		// this test errors if things are broken
		stop();
		var observe = new can.LazyMap();
		
		can.LazyMap.startBatch();
		can.trigger(observe, "change","random")
		
		setTimeout(function(){
			can.Observe.stopBatch();
			start()
		},10);
		
	});

	/* 
	test("Dot separated keys (#257, #296)", function() {
		var lm = new can.LazyMap({
			'test.value': 'testing',
			other: {
				test: 'value'
			}
		});
		equal(lm['test.value'], 'testing', 'Set value with dot separated key properly');
		equal(lm.attr('test.value'), 'testing', 'Could retrieve value with .attr');
		equal(lm.attr('other.test'), 'value', 'Still getting dot separated value');

		lm.attr({
			'other.bla': 'othervalue'
		});
		equal(lm['other.bla'], 'othervalue', 'Key is not split');
		equal(lm.attr('other.bla'), 'othervalue', 'Could retrieve value with .attr');

		lm.attr('other.stuff', 'thinger');
		equal(lm.attr('other.stuff'), 'thinger', 'Set dot separated value');
		deepEqual(lm.attr('other').serialize(), { test: 'value', stuff: 'thinger' }, 'Object set properly');
	});
	 */

	test("cycle binding",function(){
		var first = new can.LazyMap({}),
			second= new can.LazyMap({});
		
		first.attr('second', second);
		second.attr('first', second);
		
		var handler = function(){}
		
		first.bind('change', handler);		
		ok(first._bindings, "has bindings");
		
		first.unbind('change', handler);
		ok(!first._bindings, "bindings removed");
	});

	test("Deferreds are not converted", function() {
		var dfd = can.Deferred(),
			lm = new can.LazyMap({test: dfd});
		
		ok(can.isDeferred(lm.attr('test')), 'Attribute is a deferred');
		ok(!lm.attr('test')._cid, 'Does not have a _cid');
	});

	/* LazyList specific tests */

	
	test("LazyList - adding attribute changes length", 1, function(){
		var l = new can.LazyList([0,1,2])
		l.attr(3,3)
		equals(l.length, 4, "Got the right lenght after adding an attribute.");
	})

	test("LazyList - splice", 7, function(){
		var l = new can.LazyList([0,1,2,3]),
			first = true;
		l.bind('change', function( ev, attr, how, newVals, oldVals ) {
			equals (attr, "1", "Right index to splice.")
			if(first){
				equals( how, "remove", "Removing existing items ..." )
				equals( newVals, undefined, " ... without new values." )
			} else {
				equals( how, "add", "Adding new items ..." )
				same( newVals, ["a","b"] , "... with right new values.")
			}			
			first = false;
		})

		l.splice(1,2, "a", "b"); 
		same(l.serialize(), [0,"a","b", 3], "Serialized!")
	});

	test("LazyList - pop", 5, function(){
		var l = new can.LazyList([0,1,2,3]);
		
		l.bind('change', function( ev, attr, how, newVals, oldVals ) { 
			equals (attr, "3", "Right index to pop.")
			
			equals( how, "remove", "Removing the item" )
			equals( newVals, undefined, "Without new value" )
			same( oldVals, [3], "Old value equals to last element in list." )
		})
		
		l.pop(); 
		same(l.serialize(), [0,1,2], "Serialized!")
	})

	test("LazyList - Array accessor methods", 11, function() {
		var l = new can.LazyList([ 'a', 'b', 'c' ]),
			sliced = l.slice(2),
			joined = l.join(' | '),
			concatenated = l.concat([ 2, 1 ], new can.LazyList([ 0 ]));

		ok(sliced instanceof can.LazyList, "Slice is an Observable list");
		equal(sliced.length, 1, "Sliced off two elements");
		equal(sliced[0], 'c', "Single element as expected");
		equal(joined, 'a | b | c', "Joined list properly");
		ok(concatenated instanceof can.LazyList, "Concatenated is an Observable list");
		deepEqual(concatenated.serialize(), [ 'a', 'b', 'c', 2, 1, 0 ], "List concatenated properly");

		l.forEach(function(letter, index) {
			ok(true, "Iteration");
			if(index === 0) {
				equal(letter, 'a', "First letter right");
			}
			if(index === 2) {
				equal(letter, 'c', "Last letter right");
			}
		});
	});
	
	
})()
