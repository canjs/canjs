var QUnit = require("steal-qunit");
var stache = require("can-stache");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");
var queues = require("can-queues");
var SimpleObservable = require("can-simple-observable");
var Observation = require("can-observation");
var SimpleMap = require("can-simple-map");

var stacheTestHelpers = require("../test/helpers")(document);

QUnit.module("can-stache #each helper");

QUnit.test("each with sort (#498)", function(assert) {
    var template = stache("<div>{{#each(list)}}<p>{{.}}</p>{{/each}}</div>");
    var list = new DefineList([34234,2,1,3]);

    var frag = template({list: list});

    list.sort();
    // list.splice(0,4,1,2,3,34234);

    var order = [].map.call( stacheTestHelpers.cloneAndClean(frag).firstChild.getElementsByTagName("p"), function(p){
        return +p.firstChild.nodeValue;
    });

    assert.deepEqual(order, [1,2,3,34234]);
});


QUnit.test("#each throws error (can-stache-bindings#444)", function(assert) {
    var list = new DefineList([
        {name: 'A'},
        {name: 'B'},
        {name: 'C'}
    ]);
    var data = new DefineMap({
        list: list,
        item : list[1]
    });

    var template = stache(

        "<div>"+
        // The space after }} is important here
            "{{#each list}} "+
            "{{^is(., ../item)}}"+
            "<div>{{name}}</div>"+
            "{{/is}}"+
            "{{/each}}"+
        "</div>");

    template(data);


    queues.batch.start();
    queues.mutateQueue.enqueue(function clearItemAndSplice() {

      this.item = null;
      this.list.splice(1, 1);
    }, data, []);
    queues.batch.stop();

    assert.ok(true, "no errors");
});

QUnit.test("if within an each", function(assert) {
    var ready = assert.async();
    var template = stache("<div>{{# each(sortedMonthlyOSProjects ) }}{{# if(val) }}<span>Hi</span>{{/ if }}{{/ each }}</div>");

    var osProject1 = {
        val: new SimpleObservable()
    },
        osProject2 = {
            val: new SimpleObservable()
        };
    var calls = 0;

    var sortedMonthlyOSProjects = new Observation(function(){
        osProject1.val.get();
        //osProject2.val.get();
        calls++;
        if(calls % 2 === 0) {
            return [osProject1,osProject2];
        } else {

            return [osProject2, osProject1];
        }
    });

    template({sortedMonthlyOSProjects: sortedMonthlyOSProjects});

    setTimeout(function(){

        osProject1.val.set(true);
        assert.ok(true,"no errors");
        ready();
    },20);


    //osProject2.val.set(false);
});

QUnit.test("changing the list works with each", function(assert) {

    var template = stache("<ul>{{#each list}}<li>.</li>{{/each}}</ul>");

    var map = new SimpleMap({
        list: new DefineList(["foo"])
    });

    var tpl = template(map).firstChild;
    assert.equal(tpl.getElementsByTagName('li').length, 1, "one li");
    var fooLi = tpl.getElementsByTagName('li')[0];

    map.set("list", new DefineList(["foo", "car"]));

    assert.equal(tpl.getElementsByTagName('li').length, 2, "two lis");
    assert.equal(fooLi, tpl.getElementsByTagName('li')[0], "retains the same li");

});


QUnit.test("changing the list from undefined to defined", function(assert) {

    var template = stache("<ul>{{#each list}}<li>.</li>{{/each}}</ul>");

    var map = new SimpleMap({
        list: undefined
    });

    var tpl = template(map).firstChild;
    assert.equal(tpl.getElementsByTagName('li').length, 0, "no li");

    var list = new DefineList(["foo", "car"]);
    map.set("list", list);

    assert.equal(tpl.getElementsByTagName('li').length, 2, "two lis");

    var fooLi = tpl.getElementsByTagName('li')[1];

    list.shift();
    assert.equal(tpl.getElementsByTagName('li').length, 1, "one lis");
    assert.equal(fooLi, tpl.getElementsByTagName('li')[0], "retains the same li");

});
