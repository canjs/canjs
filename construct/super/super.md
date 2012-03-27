@page can.Construct.super
@parent can.Construct
@plugin can/construct/super
@test can/construct/super/qunit.html
@download http://jmvcsite.heroku.com/pluginify?plugins[]=can/construct/super/super.js

Allows you to call the base function via a `_super` attribute. Given a simple Todo construct:

	var Todo = can.Construct({
        init : function(text) {
            this.text = text;
        },
        toString : function() {
            return 'TODO: ' + this.text;
        }
    });

    var todo = new Todo('Take out trash');
    console.log(todo.toString()); // -> TODO: Take out trash

Using the *super* plugin you can create an extended version of this Todo construct and in each method
be able to access the overwritten method using `this._super` (if there is one):

	var BetterTodo = Todo({
		init : function(text, status) {
			this._super(text);
			this.status = status || 'Not done';
		},

		toString : function() {
			return '[' + this.status + ']: ' + this._super();
		}
	});

	var betterTodo = new BetterTodo('Take out trash', 'Done');
    console.log(betterTodo.toString());
    // -> [Done] TODO: Take out trash

If you want to pass all arguments to `_super` use
[apply](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/apply):

	var EvenBetterTodo = BetterTodo({
		init : function(text, status) {
			this._super.apply(this, arguments);
			this.isEvenbetter = true;
		}
	});

**Note**: It is important to include this plugin before you include other plugins that
extend Observe so that prototype chain is extended correctly.
