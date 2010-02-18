steal.plugins('jquery/class','jquery/lang').then(function(){
/**
 * @tag core
 * Controllers organize event handlers through the power of <b>[jQuery.fn.delegate|event delegation]</b>. 
 * If something happens in your application (a user click or a [jQuery.Model|Model] instance being updated), 
 * a controller should respond to it. 
 * <h3>Benefits</h3>
 * <ul>
 *     <li><i>Controllers let you know where your code is!</i><p>
 *         Controllers force you to group events and label your html in specific ways.  The result is that
 *         if an event happens on the page, you know exactly where to find the code for that event.</p></li>
 *     <li><i>Controllers are inheritable.</i><p>
 *         Package, inherit, and reuse your widgets.</p></li>
 *     <li><i>Don't attach event handlers, make rules.</i><p>
 *         Controllers use event delegation.</p></li>
 * </ul>
 * <h3>Example</h3>
 * @codestart
//Instead of:
$(function(){
  $('#tasks').click(someCallbackFunction1)
  $('#tasks .task').click(someCallbackFunction2)
  $('#tasks .task .delete').click(someCallbackFunction3)
});

//do this
$.Controller.extend('TasksController',{
  'click': function(){...},
  '.task click' : function(){...},
  '.task .delete' : function(){...}
})
$().tasks_controller();
@codeend
 * <h2>Using Controllers</h2>
 * <p>A Controller is just a list of functions that get called back when the appropriate event happens.  
 * The name of the function provides a description of when the function should be called.  By naming your functions in the correct way,
 * Controller recognizes them as <b>[jQuery.Controller.Action Actions]</b> and hook them up in the correct way.</p>
 * 
 * <p>The 'hook up' happens when you create a [jQuery.Controller.prototype.init|new controller instance].</p>
 * 
 * <p>Lets look at a very basic example.  
 * Lets say you have a list of todos and a button you want to click to create more.
 * Your HTML might look like:</p>
@codestart html
&lt;div id='todos'>
	&lt;ol>
	  &lt;li class="todo">Laundry&lt;/li>
	  &lt;li class="todo">Dishes&lt;/li>
	  &lt;li class="todo">Walk Dog&lt;/li>
	&lt;/ol>
	&lt;a id="create_todo">Create&lt;/a>
&lt;/div>
@codeend
To add a mousover effect and create todos, your controller class might look like:
@codestart
$.Controller.extend('TodosController',{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  "#create_todo click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend
Now that you've created the controller class, you've got attach the event handlers on the '#todos' div by
creating [jQuery.Controller.prototype.init|a new controller instance].  There are 2 ways of doing this.
@codestart
//1. Create a new controller directly:
new TodosController($('#todos')[0]);
//2. Use jQuery function
$('#todos').todos_controller();
@codeend

As you've likely noticed, when the [jQuery.Controller.static.init|controller class is created], it creates helper
functions on [jQuery.fn]. The "#todos" element is known as the <b>delegated</b> element.

<h3>Action Types</h3>
<p>Controller uses actions to match function names and attach events.  
By default, Controller will match [jQuery.Controller.Action.Event|Event] and [jQuery.Controller.Action.Subscribe|Subscribe] actions. 
To match other actions, steal their plugins.</p>
<table>
	<tr>
		<th>Action</th><th>Events</th><th>Example</th><th>Description</th>
	</tr>
	<tbody  style="font-size: 11px;">
	<tr>
		<td>[jQuery.Controller.Action.Event Event]</td>
		<td>change click contextmenu dblclick keydown keyup keypress mousedown mousemove mouseout mouseover mouseup reset 
			windowresize resize windowscroll scroll select submit dblclick focus blur load unload ready hashchange</td>
		<td>"a.destroy click"</td>
		<td>Matches standard DOM events</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Subscribe Subscribe]</td>
		<td>Any <a href="http://www.openajax.org/index.php">openajax</a> event</td>
		<td>"todos.*.create subscribe"</td>
		<td>Subscribes this action to OpenAjax hub.</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Drag Drag]</td>
		<td>draginit dragend dragmove</td>
		<td>".handle draginit"</td>
		<td>Matches events on a dragged object</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Drop Drop]</td>
		<td>dropover dropon dropout dropinit dropmove dropend</td>
		<td>".droparea dropon"</td>
		<td>Matches events on a droppable object</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Lasso Lasso]</td>
		<td>lassoinit lassoend lassomove</td>
		<td>"#lassoarea lassomove"</td>
		<td>Allows you to lasso elements.</td>
	</tr>
	<tr>
		<td>[jQuery.Controller.Action.Selectable Selectable]</td>
		<td>selectover selected selectout selectinit selectmove selectend</td>
		<td>".selectable selected"</td>
		<td>Matches events on elements that can be selected by the lasso.</td>
	</tr>
	</tbody>
</table>

<h3>Callback Parameters</h3>
For most actions, the first two parameters are always:
<ul>
	<li>el - the jQuery wrapped element.</li>
	<li>ev - the jQuery wrapped DOM event.</li>
</ul>
@codestart
".something click" : function(el, ev){
   el.slideUp()
   ev.stopDelegation();  //stops this event from delegating to any other
						 // delegated events for this delegated element.
   ev.preventDefault();  //prevents the default action from happening.
   ev.stopPropagation(); //stops the event from going to other elements.
}
@codeend

If the action provides different parameters, they are in each action's documentation.


<h2>onDocument Controllers</h2>
<p>Sometimes, you want your controllers to delegate from the document or documentElement.  Typically this is
done in less complex applications where you know there will only be a single instance of the controller
on the page.</p>
<p>The advantage of onDocument Controllers is that they can be automatically attached to the document for you.</p>
To automatically attach to the document, add "onDocument: true" to your controller as follows:
@codestart
$.Controller.extend('TodosController',
{onDocument: true},
{
  ".todo mouseover" : function(el, ev){
	  el.css("backgroundColor","red")
  },
  ".todo mouseout" : function(el, ev){
	  el.css("backgroundColor","")
  },
  "#create_todo click" : function(){
	  this.find("ol").append("&lt;li class='todo'>New Todo&lt;/li>"); 
  }
})
@codeend

 */
jQuery.Class.extend("jQuery.Controller",
/* @Static*/
{
	/**
	 * Does 2 things:
	 * <ol>
	 *     <li>Creates a jQuery helper for this controller</li>
	 *     <li> and attaches this element to the documentElement if onDocument is true</li>
	 * </ol>   
	 * <h3>jQuery Helper Naming Examples</h3>
	 * @codestart
	 * "TaskController" -> $().task_controller()
	 * "Controllers.Task" -> $().controllers_task()
	 * @codeend
	 */
	init : function(){
		if(!this.shortName  || this.fullName == "jQuery.Controller") return;
		this.underscoreFullName = $.String.underscore(this.fullName.replace(/\./g,'_').replace(/_?controllers?/i,""));
		this.underscoreShortName = $.String.underscore(this.shortName.replace(/\./g,'_').replace(/_?controllers?/i,""));
		this.underscoreControllerName = this.shortName.replace(/\./g,'_').replace(/_?controllers?/i,"");
		
		var val, act;
		//if(!this.modelName)
		//    this.modelName = jQuery.String.isSingular(this.underscoreName) ? this.underscoreName : jQuery.String.singularize(this.underscoreName)

		//if(steal.getPath().match(/(.*?)controllers/)){
		//    this._path = steal.getPath().match(/(.*?)controllers/)[1]+"controllers";
		//}else{
		//    this._path = steal.getPath()+"/"
		//}
		
		var controller = this;
		
		/**
		 * @attribute onDocument
		 * Set to true if you want to automatically attach this element to the documentElement.
		 */
		if(this.onDocument)
			new this(document.documentElement);

		 
		 
		 var pluginname = this.underscoreFullName;
		 if(!jQuery.fn[pluginname]) {
			jQuery.fn[pluginname] = function(options){
				var args = $.makeArray(arguments), 
					isMethod = typeof options == "string" && typeof controller.prototype[options] == "function",
					meth = args[0],
					allCreated = true;;
				this.each(function(){
				//check if created
					var plugin = $.data(this,pluginname);
					if(plugin){
						if(isMethod)
							plugin[meth].apply(plugin, args.slice(1))
					}else{
						allCreated = false;
						controller.newInstance.apply(controller, [this].concat(args))
					}
				})
				return this;
			}
			
		 }
		
		//calculate actions
		this.actions = {};
		var convertedName, act, parts, c = this, replacer = /\{([^\}]+)\}/g, b = c.breaker;
		for (funcName in this.prototype) {
			convertedName = funcName.replace(replacer, function(whole, inside){
				//convert inside to type
				return jQuery.Class.getObject(inside, c).toString()
			})
			parts = convertedName.match( b)
			act = c.processors[parts[2]] || ($.inArray(parts[2], c.listensTo ) > -1 && c.basicProcessor) || ( parts[1] && c.basicProcessor) ;
			if(act){
				this.actions[funcName] = {action: act, parts: parts}
			}
		}
		
	},
	breaker : /^(?:(.*?)\s)?([\w\.]+)$/,
	listensTo : []//,
	//actions : [] //list of action types
},
/* @Prototype */
{
	/**
	 * Does three things:
	 * <ol>
	 *     <li>Matches and creates actions.</li>
	 *     <li>Set the controller's element.</li>
	 *     <li>Saves a reference to this controller in the element's data.</li>
	 * </ol>  
	 * @param {HTMLElement} element the element this instance operates on.
	 */
	setup: function(element){
		var funcName, convertedName, func, a, act, c = this.Class, b = c.breaker, cb;
		element = element.jquery ? element[0] : element;
		//needs to go through prototype, and attach events to this instance
		this.element = jQuery(element).addClass(this.Class.underscoreFullName );
		$.data(element,this.Class.underscoreFullName, this)
		this._actions = {};
		for(funcName in c.actions){
			var ready = c.actions[funcName]
			cb = this.callback(funcName)
			this._actions[funcName] = ready.action(element, ready.parts[2], ready.parts[1], cb, this)
		}
		 
		 /*for(funcName in this){
			//replace {} with args names
			convertedName = funcName.replace(/\{([^\}]+)\}/g, function(whole, inside){
				//convert inside to type
				return jQuery.Class.getObject(inside, c).toString()
			})
			var parts = convertedName.match( b)
			act = c.processors[parts[2]] || ($.inArray(parts[2], c.listensTo ) > -1 && c.basicProcessor) || ( parts[1] && c.basicProcessor) ;// uses event by default if 2 parts
			if(act){
				cb = this.callback(funcName)
				this._actions[funcName] = act(element, parts[2], parts[1], cb, this);
			}
		}*/
		/**
		 * @attribute called
		 * String name of current function being called on controller instance.  This is 
		 * used for picking the right view in render.
		 * @hide
		 */
		this.called = "init";
		/**
		 * @attribute element
		 * The controller instance's delegated element.  This is set by [jQuery.Controller.prototype.init init].
		 * It is a jQuery wrapped element.
		 * @codestart
		 * ".something click" : function(){
		 *    this.element.css("color","red")
		 * }
		 * @codeend
		 */
		return this.element;
	},
	
	/**
	 * Removes all actions on this instance.
	 */
	destroy: function(){
		if(this._destroyed) throw this.Class.shortName+" controller instance has already been deleted";
		
		var self = this;
		jQuery.each(this._actions, function(key, value){
			var func = self._actions[key];
			if(typeof func == "function") func(self.element[0]);
		});
		
		delete this._actions;
		this._destroyed = true;
		//clear element
		$.removeData(this.element[0],this.Class.underscoreFullName)
		var controllers = this.element.data("controllers");
		this.element = null;
	},
	/**
	 * Queries from the controller's delegated element.
	 * @codestart
	 * ".destroy_all click" : function(){
	 *    this.find(".todos").remove();
	 * }
	 * @codeend
	 * @param {String} selector selection string
	 */
	find: function(selector){
		return this.element.find(selector);
	},
	/**
	 * Publishes a message to OpenAjax.hub.
	 * @param {String} message Message name, ex: "Something.Happened".
	 * @param {Object} data The data sent.
	 */
	publish: function(){
		OpenAjax.hub.publish.apply(OpenAjax.hub, arguments);
	},
	//tells callback to set called on this.  I hate this.
	_set_called : true
});


//lets add the processors :


jQuery.Controller.processors = {};
var basic = (jQuery.Controller.basicProcessor =function(el, event, selector, cb){
	if(selector){
		var jq = jQuery()
		jq.selector = selector;
		jq.context = el;
		jq.live(event, function(){ return cb.apply(null, [jQuery(this)].concat( Array.prototype.slice.call(arguments, 0) )) });
		return function(){
		    var ev = event;
		    jq.die(ev);
		}
	}else{
		jQuery(el).bind(event, function(){ return cb.apply(null, [jQuery(this)].concat( Array.prototype.slice.call(arguments, 0) )) });
		return function(){
			var element = el;
		    jQuery(element).unbind(event);
		}
	}
})

jQuery.each(["change","click","contextmenu","dblclick","keydown","keyup","keypress","mousedown","mousemove","mouseout","mouseover","mouseup","reset","windowresize","resize","windowscroll","scroll","select","submit","dblclick","focus","blur","load","unload","ready","hashchange"], function(i ,v){
	jQuery.Controller.processors[v] = basic;
})


$.fn.mixin = function(){
	//create a bunch of controllers
	var controllers = $.makeArray(arguments);
	return this.each(function(){
		for(var i = 0 ; i < controllers.length; i++){
			new controllers[i](this)
		}
		
	})
}


})