var QueryLogic = require("can-query-logic");
var canReflect = require("can-reflect");
var makeEnum = require("../src/types/make-enum");


QUnit.module("can-query-logic with makeEnum");

function Color(){}
makeEnum(Color, ["red","green","blue"]);

var TODO = canReflect.assignSymbols({},{
    "can.getSchema": function(){
        return {
            kind: "record",
            identity: ["id"],
            keys: {
                id: Number,
                points: Number,
                status: Color,
                complete: Boolean,
                name: String
            }
        };
    }
});

var algebra = new QueryLogic(TODO);

QUnit.test("union - enum", function(assert) {

    var unionResult = algebra.union({
        filter: {
            name: "Justin",
            status: "red"
        }
    },{
        filter: {
            name: "Justin",
            status: "green"
        }
    });

    assert.deepEqual(unionResult, {
        filter: {
            name: "Justin",
            status: ["red","green"]
        }
    });
});


QUnit.test("automatic enum", function(assert) {

    var MaybeBoolean = canReflect.assignSymbols({},{
    	"can.new": function(val){
    		if(val == null) {
    			return val;
    		}
    		if (val === 'false' || val === '0' || !val) {
    			return false;
    		}
    		return true;
    	},
    	"can.getSchema": function(){
    		return {
    			type: "Or",
    			values: [true, false, undefined, null]
    		};
    	}
    });

    var queryLogic = new QueryLogic({
        identity: ["id"],
        keys: {
            complete: MaybeBoolean
        }
    });
    var res;

    res = queryLogic.difference({},{
        filter: {
            complete: true
        }
    });

    assert.deepEqual(res,{
        filter: {
            complete: [false, undefined, null]
        }
    }, "enum works");
});

QUnit.test("makeEnum from homepage with schema type", function(assert) {
    var Status = canReflect.assignSymbols({},{
    	"can.new": function(val){
    		return val;
    	},
    	"can.getSchema": function(){
    		return {
    			type: "Or",
    			values: ["new","assigned","complete"]
    		};
    	}
    });

    var todoLogic = new QueryLogic({
        identity: ["id"],
        keys: {
            status: Status
        }
    });
    var unionQuery = todoLogic.union(
        {filter: {status: ["new","assigned"] }},
        {filter: {status: "complete" }}
    );

    assert.deepEqual( unionQuery, {});
});


QUnit.test("makeEnum from homepage", function(assert) {

    var Status = QueryLogic.makeEnum(["new","assigned","complete"]);

    var todoLogic = new QueryLogic({
        identity: ["id"],
        keys: {
            status: Status
        }
    });
    var unionQuery = todoLogic.union(
        {filter: {status: ["new","assigned"] }},
        {filter: {status: "complete" }}
    );

    assert.deepEqual( unionQuery, {});
});
