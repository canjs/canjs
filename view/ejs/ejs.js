steal('can/view', 'can/util/string').then(function( $ ) {

	// ## ejs.js
	// `can.EJS`  
	// _Embedded JavaScript Templates._

	// Helper methods.
	var myEval = function( script ) {
		eval(script);
	},
		extend = can.extend,
		// Regular expressions for caching.
		quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
		attrReg = /([^\s]+)=$/,
		newLine = /(\r|\n)+/g,
		attributeReplace = /__!!__/g,
		tagMap = {
			"": "span", 
			table: "tr", 
			tr: "td", 
			ol: "li", 
			ul: "li", 
			tbody: "tr",
			thead: "tr",
			tfoot: "tr"
		},
		// Escapes characters starting with `\`.
		clean = function( content ) {
			return content
				.split('\\').join("\\\\")
				.split("\n").join("\\n")
				.split('"').join('\\"')
				.split("\t").join("\\t");
		},
		bracketNum = function(content){
			return (--content.split("{").length) - (--content.split("}").length);
		},
		setAttr = function(el, attrName, val){
			attrName === "class" ?
				(el.className = val):
				el.setAttribute(attrName, val);
		},
		getAttr = function(el, attrName){
			return attrName === "class"?
				el.className:
				el.getAttribute(attrName);
		},
		// Used to bind to an `observe` and unbind when the element is removed.
		// `oldObserved` is a mapping of `observe` namespaces to instances.
		liveBind = function( observed, el, cb, oldObserved ) {
			// We are going to set everything to matched that we find.
			var first = oldObserved.matched === undefined;
			oldObserved.matched = !oldObserved.matched;
			can.each(observed, function(i, ob){
				if(oldObserved[ob.obj._namespace+"|"+ob.attr]){
					oldObserved[ob.obj._namespace+"|"+ob.attr].matched = oldObserved.matched;
				} else {
					ob.matched = oldObserved.matched;
					oldObserved[ob.obj._namespace+"|"+ob.attr] = ob
					ob.obj.bind(ob.attr, cb)
				}
			})
			// Remove any old bindings.
			for ( var name in oldObserved ) {
				var ob = oldObserved[name];
				if(name !== "matched" && ob.matched !== oldObserved.matched){
					ob.obj.unbind(ob.attr);
					delete oldObserved[name];
				}
			}
			if(first){
				can.bind.call(el,'destroyed', function(){
					can.each(oldObserved, function(i, ob){
						if(typeof ob !== 'boolean'){
							ob.obj.unbind(ob.attr, cb)
						}
					})
				})
			}

		},
		contentEscape = function( txt ) {
			// Return sanatized text.
			return (typeof txt == 'string' || typeof txt == 'number') ?
				can.esc( txt ) :
				contentText(txt);
		},
		contentText =  function( input ) {	
			
			// If it's a string, return.
			if ( typeof input == 'string' ) {
				return input;
			}
			// If has no value, return an empty string.
			if ( !input && input != 0 ) {
				return '';
			}

			// If it's an object, and it has a hookup method.
			var hook = (input.hookup &&

			// Make a function call the hookup method.
			function( el, id ) {
				input.hookup.call(input, el, id);
			}) ||

			// Or if it's a `function`, just use the input.
			(typeof input == 'function' && input);

			// Finally, if there is a `function` to hookup on some dom,
			// add it to pending hookups.
			if ( hook ) {
				pendingHookups.push(hook);
				return '';
			}

			// Finally, if all else is `false`, `toString()` it.
			return "" + input;
		},
		getValueAndObserved = function(func, self){
			if (can.Observe) {
				can.Observe.__reading = function(obj, attr){
					observed.push({
						obj: obj,
						attr: attr
					});
				}
			}
			// Get value.
			var observed = [],
				input = func.call(self);
	
			// Set back so we are no longer reading.
			if(can.Observe){
				delete can.Observe.__reading;
			}
			return {
				value : input,
				observed : observed
			}
		},
		/**
		 * @class can.EJS
		 * 
		 * @plugin can/view/ejs
		 * @parent can.View
		 * @download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/view/ejs/ejs.js
		 * @test can/view/ejs/qunit.html
		 * 
		 * 
		 * Ejs provides <a href="http://www.ruby-doc.org/stdlib/libdoc/erb/rdoc/">ERB</a> 
		 * style client side templates.  Use them with controllers to easily build html and inject
		 * it into the DOM.
		 * 
		 * ###  Example
		 * 
		 * The following generates a list of tasks:
		 * 
		 * @codestart html
		 * &lt;ul>
		 * &lt;% for(var i = 0; i < tasks.length; i++){ %>
		 *     &lt;li class="task &lt;%= tasks[i].identity %>">&lt;%= tasks[i].name %>&lt;/li>
		 * &lt;% } %>
		 * &lt;/ul>
		 * @codeend
		 * 
		 * For the following examples, we assume this view is in <i>'views\tasks\list.ejs'</i>.
		 * 
		 * 
		 * ## Use
		 * 
		 * ### Loading and Rendering EJS:
		 * 
		 * You should use EJS through the helper functions [jQuery.View] provides such as:
		 * 
		 *   - [jQuery.fn.after after]
		 *   - [jQuery.fn.append append]
		 *   - [jQuery.fn.before before]
		 *   - [jQuery.fn.html html], 
		 *   - [jQuery.fn.prepend prepend],
		 *   - [jQuery.fn.replaceWith replaceWith], and 
		 *   - [jQuery.fn.text text].
		 * 
		 * or [Can.Control.prototype.view].
		 * 
		 * ### Syntax
		 * 
		 * EJS uses 5 types of tags:
		 * 
		 *   - <code>&lt;% CODE %&gt;</code> - Runs JS Code.
		 *     For example:
		 *     
		 *         <% alert('hello world') %>
		 *     
		 *   - <code>&lt;%= CODE %&gt;</code> - Runs JS Code and writes the _escaped_ result into the result of the template.
		 *     For example:
		 *     
		 *         <h1><%= 'hello world' %></h1>
		 *         
		 *   - <code>&lt;%== CODE %&gt;</code> - Runs JS Code and writes the _unescaped_ result into the result of the template.
		 *     For example:
		 *     
		 *         <h1><%== '<span>hello world</span>' %></h1>
		 *         
		 *   - <code>&lt;%%= CODE %&gt;</code> - Writes <%= CODE %> to the result of the template.  This is very useful for generators.
		 *     
		 *         <%%= 'hello world' %>
		 *         
		 *   - <code>&lt;%# CODE %&gt;</code> - Used for comments.  This does nothing.
		 *     
		 *         <%# 'hello world' %>
		 *        
		 * ## Hooking up controllers
		 * 
		 * After drawing some html, you often want to add other widgets and plugins inside that html.
		 * View makes this easy.  You just have to return the Contoller class you want to be hooked up.
		 * 
		 * @codestart
		 * &lt;ul &lt;%= Mxui.Tabs%>>...&lt;ul>
		 * @codeend
		 * 
		 * You can even hook up multiple controllers:
		 * 
		 * @codestart
		 * &lt;ul &lt;%= [Mxui.Tabs, Mxui.Filler]%>>...&lt;ul>
		 * @codeend
		 * 
		 * To hook up a controller with options or any other jQuery plugin use the
		 * [can.EJS.Helpers.prototype.plugin | plugin view helper]:
		 * 
		 * @codestart
		 * &lt;ul &lt;%= plugin('mxui_tabs', { option: 'value' }) %>>...&lt;ul>
		 * @codeend
		 * 
		 * Don't add a semicolon when using view helpers.
		 * 
		 * 
		 * <h2>View Helpers</h2>
		 * View Helpers return html code.  View by default only comes with 
		 * [can.EJS.Helpers.prototype.view view] and [can.EJS.Helpers.prototype.text text].
		 * You can include more with the view/helpers plugin.  But, you can easily make your own!
		 * Learn how in the [can.EJS.Helpers Helpers] page.
		 * 
		 * @constructor Creates a new view
		 * @param {Object} options A hash with the following options
		 * <table class="options">
		 *     <tbody><tr><th>Option</th><th>Default</th><th>Description</th></tr>
		 *     <tr>
		 *      <td>text</td>
		 *      <td>&nbsp;</td>
		 *      <td>uses the provided text as the template. Example:<br/><code>new View({text: '&lt;%=user%>'})</code>
		 *      </td>
		 *     </tr>
		 *     <tr>
		 *      <td>type</td>
		 *      <td>'<'</td>
		 *      <td>type of magic tags.  Options are '&lt;' or '['
		 *      </td>
		 *     </tr>
		 *     <tr>
		 *      <td>name</td>
		 *      <td>the element ID or url </td>
		 *      <td>an optional name that is used for caching.
		 *      </td>
		 *     </tr>
		 *    </tbody></table>
		 */
		EJS = function( options ) {
			if ( this.constructor != EJS ) {
				var ejs = new EJS(options);
				return function( data, helpers ) {
					return ejs.render(data, helpers);
				};
			}
			// If we get a `function` directly, it probably is coming from
			// a `steal`-packaged view.
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}
			// Set options on self.
			extend(this, options);
			this.template = scan(this.text, this.name);
		};

	can.EJS = EJS;
	/** 
	 * @Prototype
	 */
	EJS.prototype.
	/**
	 * Renders an object with view helpers attached to the view.
	 * 
	 *     new EJS({text: "<%= message %>"}).render({
	 *       message: "foo"
	 *     },{helper: function(){ ... }})
	 *     
	 * @param {Object} object data to be rendered
	 * @param {Object} [extraHelpers] an object with view helpers
	 * @return {String} returns the result of the string
	 */
	render = function( object, extraHelpers ) {
		object = object || {};
		return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
	};
	/**
	 * @Static
	 */
	extend(EJS, {
		/**
		 * @hide
		 * called to setup unescaped text
		 * @param {Number|String} status
		 *   - "string" - the name of the attribute  <div string="HERE">
		 *   - 1 - in an html tag <div HERE></div>
		 *   - 0 - in the content of a tag <div>HERE</div>
		 *   
		 * @param {Object} self
		 * @param {Object} func
		 */
		txt : function(tagName, status, self, func, escape){
			// Set callback on reading...
			var res = getValueAndObserved(func, self),
				observed = res.observed,
				input = res.value,
				oldObserved = {},
				tag = (tagMap[tagName] || "span");
	


			// If we had no observes.
			if(!observed.length){
				return (escape || status !== 0? contentEscape : contentText)(input);
			}

			if(status == 0){
				return "<" +tag+can.view.hook(
				// Are we escaping?
				escape ? 
					function(el){
						// Remove child, bind on parent.
						var parent = el.parentNode,
							node = document.createTextNode(input),
							binder = function(){
								var res = getValueAndObserved(func, self);
								node.nodeValue = ""+res.value;
								liveBind(res.observed, parent, binder,oldObserved);
							};
						
						parent.insertBefore(node, el);
						parent.removeChild(el);
						
						// Create `textNode`.
						liveBind(observed, parent, binder,oldObserved);
					}
					:
					function(span){
						// Remove child, bind on parent.
						var makeAndPut = function(val, remove){
								// Get `fragment` of html to `fragment`.
								var frag = can.view.frag(val),
									// Wrap it to keep a reference to the elements...
									nodes = can.map(frag.childNodes,function(node){
										return node;
									}),
									last = remove[remove.length - 1];
								
								// Insert it in the `document`.
								if( last.nextSibling ){
									last.parentNode.insertBefore(frag, last.nextSibling)
								} else {
									last.parentNode.appendChild(frag)
								}
								
								// Remove the old content.
								can.remove( can.$(remove) );
								return nodes;
							},
							nodes = makeAndPut(input, [span]);
						// Listen to changes and update. 
						// Make sure the parent does not die.
						// We might simply check that nodes is still in the `document` 
						// before a write...
						var binder = function(){
							var res = getValueAndObserved(func, self);
							nodes = makeAndPut(res.value, nodes);
							
							liveBind(res.observed, span.parentNode, binder ,oldObserved);
						}
						liveBind(observed, span.parentNode, binder ,oldObserved);
				}) + "></" +tag+">";
			} else if(status === 1){ // In a tag.
				// Mark at end!
				var attrName = input.replace(/['"]/g, '').split('=')[0];
				pendingHookups.push(function(el) {
					var binder = function() {
						var res = getValueAndObserved(func, self),
							parts = (res.value || "").replace(/['"]/g, '').split('='),
							newAttrName = parts[0];
						
						// Remove if we have a change and used to have an `attrName`.
						if((newAttrName != attrName) && attrName){
							el.removeAttribute(attrName)
						}
						// Set if we have a new `attrName`.
						if(newAttrName){
							setAttr(el, newAttrName, parts[1])
						}
						liveBind(res.observed, el, binder,oldObserved);
					}
					
					liveBind(observed, el, binder,oldObserved);
				});

				return input;
			} else { // In an attribute...
				pendingHookups.push(function(el){
					var wrapped = can.$(el),
						hooks;
					
					// Get the list of hookups or create one for this element.
					// Hooks is a map of attribute names to hookup `data`s.
					// Each hookup data has:
					// `render` - A `function` to render the value of the attribute.
					// `funcs` - A list of hookup `function`s on that attribute.
					// `batchNum` - The last event `batchNum`, used for performance.
					(hooks = can.data(wrapped,'hooks')) || can.data(wrapped, 'hooks', hooks = {});
					
					// Get the attribute value.
					var attr = getAttr(el, status),
						// Split the attribute value by the template.
						parts = attr.split("__!!__"),
						hook,
						binder = function(ev){
							if(ev.batchNum === undefined || ev.batchNum !== hook.batchNum){
								hook.batchNum = ev.batchNum;
								setAttr(el, status, hook.render());
							} 
						};

					// If we already had a hookup for this attribute...
					if(hooks[status]) {
						// Just add to that attribute's list of `function`s.
						hooks[status].funcs.push({func: func, old: oldObserved});
					}
					else {
						// Create the hookup data.
						hooks[status] = {
							render: function() {
								var i =0,
									newAttr = attr.replace(attributeReplace, function() {
										var ob = getValueAndObserved(hook.funcs[i].func, self);
										liveBind(ob.observed, el, binder, hook.funcs[i++].old)
										return contentText( ob.value );
									});
								return newAttr;
							},
							funcs: [{func: func, old: oldObserved}],
							batchNum : undefined
						};
					};

					// Save the hook for slightly faster performance.
					hook = hooks[status];

					// Insert the value in parts.
					parts.splice(1,0,input);

					// Set the attribute.
					setAttr(el, status, parts.join(""));
					
					// Bind on change.
					liveBind(observed, el, binder,oldObserved);
				})
				return "__!!__";
			}
		},
		// Called to setup escaped text.
		esc : function(tagName, status, self, func){
			return EJS.txt(tagName, status, self, func, true)
		},
		pending: function() {
			if(pendingHookups.length) {
				var hooks = pendingHookups.slice(0);

				pendingHookups = [];
				return can.view.hook(function(el){
					can.each(hooks, function(i, fn){
						fn(el);
					})
				});
			}else {
				return "";
			}
		}
});
	// Start scanning code.
	var tokenReg = new RegExp("(" +[ "<%%", "%%>", "<%==", "<%=", 
					"<%#", "<%", "%>", "<", ">", '"', "'"].join("|")+")","g"),
		// Commands for caching.
		startTxt = 'var ___v1ew = [];',
		finishTxt = "return ___v1ew.join('')",
		put_cmd = "___v1ew.push(",
		insert_cmd = put_cmd,
		// Global controls (used by other functions to know where we are).
		//  
		// Are we inside a tag?
		htmlTag = null,
		// Are we within a quote within a tag?
		quote = null,
		// What was the text before the current quote? (used to get the `attr` name)
		beforeQuote = null,
		// Used to mark where the element is.
		status = function(){
			// `t` - `1`.
			// `h` - `0`.
			// `q` - String `beforeQuote`.
			return quote ? "'"+beforeQuote.match(attrReg)[1]+"'" : (htmlTag ? 1 : 0)
		},
		pendingHookups = [],
		scan = function(source, name){
			var tokens = [],
				last = 0;
			
			source = source.replace(newLine, "\n");
			source.replace(tokenReg, function(whole, part, offset){
				if(offset > last){
					tokens.push( source.substring(last, offset) );
				} 
				tokens.push(part)
				last = offset+part.length;
			})
			if(last === 0){
				tokens.push(source)
			}
			
			var content = '',
				buff = [startTxt],
				// Helper `function` for putting stuff in the view concat.
				put = function( content, bonus ) {
					buff.push(put_cmd, '"', clean(content), '"'+(bonus||'')+');');
				},
				// A stack used to keep track of how we should end a bracket
				// `}`.  
				// Once we have a `<%= %>` with a `leftBracket`,
				// we store how the file should end here (either `))` or `;`).
				endStack =[],
				// The last token, used to remember which tag we are in.
				lastToken,
				// The corresponding magic tag.
				startTag = null,
				// Was there a magic tag inside an html tag?
				magicInTag = false,
				// The current tag name.
				tagName = '',
				// Declared here.
				bracketCount,
				i = 0,
				token;

			// Reinitialize the tag state goodness.
			htmlTag = quote = beforeQuote = null;

			for (; (token = tokens[i++]) !== undefined;) {

				if ( startTag === null ) {
					switch ( token ) {
					case '<%':
					case '<%=':
					case '<%==':
						magicInTag = 1;
					case '<%#':
						// A new line -- just add whatever content within a clean.  
						// Reset everything.
						startTag = token;
						if ( content.length ) {
							put(content);
						}
						content = '';
						break;

					case '<%%':
						// Replace `<%%` with `<%`.
						content += '<%';
						break;
					case '<':
						// Make sure we are not in a comment.
						if(tokens[i].indexOf("!--") !== 0) {
							htmlTag = 1;
							magicInTag = 0;
						}
						content += token;
						break;
					case '>':
						htmlTag = 0;
						// TODO: all `<%=` in tags should be added to pending hookups.
						if(magicInTag){
							put(content, ",can.EJS.pending(),\">\"");
							content = '';
						} else {
							content += token;
						}
						
						break;
					case "'":
					case '"':
						// If we are in an html tag, finding matching quotes.
						if(htmlTag){
							// We have a quote and it matches.
							if(quote && quote === token){
								// We are exiting the quote.
								quote = null;
								// Otherwise we are creating a quote.
								// TODO: does this handle `\`?
							} else if(quote === null){
								quote = token;
								beforeQuote = lastToken;
							}
						}
					default:
						if(lastToken === '<'){
							tagName = token.split(' ')[0];
						}
						content += token;
						break;
					}
				}
				else {
					// We have a start tag.
					switch ( token ) {
					case '%>':
						// `%>`
						switch ( startTag ) {
						case '<%':
							// `<%`
							
							// Get the number of `{ minus }`
							bracketCount = bracketNum(content);
							
							// We are ending a block.
							if (bracketCount == 1) {

								// We are starting on.
								buff.push(insert_cmd, "can.EJS.txt('"+tagName+"'," + status() + ",this,function(){", startTxt, content);
								
								endStack.push({
									before: "",
									after: finishTxt+"}));"
								})
							}
							else {
								
								// How are we ending this statement?
								var last = // If the stack has value and we are ending a block...
									 endStack.length && bracketCount == -1 ? // Use the last item in the block stack.
									 endStack.pop() : // Or use the default ending.
								{
									after: ";"
								};
								
								// If we are ending a returning block, 
								// add the finish text which returns the result of the
								// block.
								if (last.before) {
									buff.push(last.before)
								}
								// Add the remaining content.
								buff.push(content, ";",last.after);
							}
							break;
						case '<%=':
						case '<%==':
							// We have an extra `{` -> `block`.
							// Get the number of `{ minus }`.
							bracketCount = bracketNum(content);
							// If we have more `{`, it means there is a block.
							if( bracketCount ){
								// When we return to the same # of `{` vs `}` end with a `doubleParent`.
								endStack.push({
									before : finishTxt,
									after: "}));"
								})
							} 
							// Check if its a func like `()->`
							if(quickFunc.test(content)){
								var parts = content.match(quickFunc)
								content = "function(__){var "+parts[1]+"=can.$(__);"+parts[2]+"}"
							}
							
							// If we have `<%== a(function(){ %>` then we want
							// `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.
							buff.push(insert_cmd, "can.EJS."+(startTag === '<%=' ? "esc" : "txt")+"('"+tagName+"'," + status()+",this,function(){ return ", content, 
								// If we have a block.
								bracketCount ? 
								// Start with startTxt `"var _v1ew = [];"`.
								startTxt : 
								// If not, add `doubleParent` to close push and text.
								"}));"
								);
							break;
						}
						startTag = null;
						content = '';
						break;
					case '<%%':
						content += '<%';
						break;
					default:
						content += token;
						break;
					}
					
				}
				lastToken = token;
			}
			
			// Put it together...
			if ( content.length ) {
				// Should be `content.dump` in Ruby.
				put(content)
			}
			buff.push(";")
			var template = buff.join(''),
				out = {
					out: 'with(_VIEW) { with (_CONTEXT) {' + template + " "+finishTxt+"}}"
				};
			// Use `eval` instead of creating a function, because it is easier to debug.
			myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL=' + name + ".js");
			return out;
		};
	
	

	/**
	 * @class can.EJS.Helpers
	 * @parent can.EJS
	 * By adding functions to can.EJS.Helpers.prototype, those functions will be available in the 
	 * views.
	 * 
	 * The following helper converts a given string to upper case:
	 * 
	 * 	can.EJS.Helpers.prototype.toUpper = function(params)
	 * 	{
	 * 		return params.toUpperCase();
	 * 	}
	 * 
	 * Use it like this in any EJS template:
	 * 
	 * 	<%= toUpper('javascriptmvc') %>
	 * 
	 * To access the current DOM element return a function that takes the element as a parameter:
	 * 
	 * 	can.EJS.Helpers.prototype.upperHtml = function(params)
	 * 	{
	 * 		return function(el) {
	 * 			$(el).html(params.toUpperCase());
	 * 		}
	 * 	}
	 * 
	 * In your EJS view you can then call the helper on an element tag:
	 * 
	 * 	<div <%= upperHtml('javascriptmvc') %>></div>
	 * 
	 * 
	 * @constructor Creates a view helper.  This function 
	 * is called internally.  You should never call it.
	 * @param {Object} data The data passed to the 
	 * view.  Helpers have access to it through this._data
	 */
	EJS.Helpers = function( data, extras ) {
		this._data = data;
		this._extras = extras;
		extend(this, extras);
	};
	/**
	 * @prototype
	 */
	EJS.Helpers.prototype = {
		/**
		 * Renders a partial view.  This is deprecated in favor of <code>can.View()</code>.
		 */
		view: function( url, data, helpers ) {
			return $View(url, data || this._data, helpers || this._extras); 		
		},
		list : function(list, cb){
			list.attr('length')
			for(var i = 0, len = list.length; i < len; i++){
				cb(list[i], i, list)
			}
		}
	};

	// Options for `steal`'s build.
	can.view.register({
		suffix: "ejs",
		// returns a `function` that renders the view.
		script: function( id, src ) {
			return "can.EJS(function(_CONTEXT,_VIEW) { " + new EJS({
				text: src,
				name: id
			}).template.out + " })";
		},
		renderer: function( id, text ) {
			return EJS({
				text: text,
				name: id
			});
		}
	});
});
