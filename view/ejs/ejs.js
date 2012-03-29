// 2.04
/*jslint evil: true */
steal('can/view', 'can/util/string').then(function( $ ) {

	// HELPER METHODS ==============
	var myEval = function( script ) {
		eval(script);
	},
		// removes the last character from a string
		// this is no longer needed
		extend = can.extend,
		// regular expressions for caching
		quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
		attrReg = /([^\s]+)=$/,
		newLine = /(\r|\n)+/g,
		attributeReplace = /__!!__/g,
		tagMap = {"": "span", table: "tr", tr: "td", ol: "li", ul: "li", tbody: "tr", thead: "tr", tfoot: "tr"},
		// escapes characters starting with \
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
		// used to bind to an observe, and unbind when the element is removed
		liveBind = function(observed, el, cb){
			can.each(observed, function(i, ob){
				ob.obj.bind(ob.attr, cb)
			})
			can.bind.call(el,'destroyed', function(){
				can.each(observed, function(i, ob){
					ob.obj.unbind(ob.attr, cb)
				})
			})
		},
		contentEscape = function( txt ) {
			//return sanatized text
			return (typeof txt == 'string' || typeof txt == 'number') ?
				can.esc( txt ) :
				contentText(txt);
		},
		contentText =  function( input ) {	
			
			// if it's a string, return
			if ( typeof input == 'string' ) {
				return input;
			}
			// if has no value
			if ( !input && input != 0 ) {
				return '';
			}

			// if it's an object, and it has a hookup method
			var hook = (input.hookup &&
			// make a function call the hookup method

			function( el, id ) {
				input.hookup.call(input, el, id);
			}) ||
			// or if it's a function, just use the input
			(typeof input == 'function' && input);
			// finally, if there is a funciton to hookup on some dom
			// add it to pending hookups
			if ( hook ) {
				pendingHookups.push(hook);
				return '';
			}
			// finally, if all else false, toString it
			return ""+input;
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
			// if we get a function directly, it probably is coming from
			// a steal-packaged view
			if ( typeof options == "function" ) {
				this.template = {
					fn: options
				};
				return;
			}
			//set options on self
			extend(this, options);
			this.template = scan(this.text, this.name);
		};
	// add EJS to jQuery if it exists
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
			// set callback on reading ...
			if (can.Observe) {
				can.Observe.__reading = function(obj, attr){
					observed.push({
						obj: obj,
						attr: attr
					});
				}
			}
			// get value
			var observed = [],
				input = func.call(self),
				tag = (tagMap[tagName] || "span");
	
			// set back so we are no longer reading
			if(can.Observe){
				delete can.Observe.__reading;
			}

			// if we had no observes
			if(!observed.length){
				return (escape || status !== 0? contentEscape : contentText)(input);
			}

			if(status == 0){
				return "<" +tag+can.view.hook(
				// are we escaping
				escape ? 
					// 
					function(el){
						// remove child, bind on parent
						var parent = el.parentNode,
							node = document.createTextNode(input);
						
						parent.insertBefore(node, el);
						parent.removeChild(el);
						
						// create textNode
						liveBind(observed, parent, function(){
							node.nodeValue = ""+func.call(self);
						});
					}
					:
					function(span){
						// remove child, bind on parent
						var makeAndPut = function(val, remove){
								// get fragement of html to fragment
								var frag = can.view.frag(val),
									// wrap it to keep a reference to the elements .. 
									nodes = can.$(can.map(frag.childNodes,function(node){
										return node;
									})),
									last = remove[remove.length - 1];
								
								// insert it in the document
								if( last.nextSibling ){
									last.parentNode.insertBefore(frag, last.nextSibling)
								} else {
									last.parentNode.appendChild(frag)
								}
								
								// remove the old content
								can.remove( can.$(remove) );
								//can.view.hookup(nodes);
								return nodes;
							},
							nodes = makeAndPut(input, [span]);
						// listen to changes and update
						// make sure the parent does not die
						// we might simply check that nodes is still in the document 
						// before a write ...
						liveBind(observed, span.parentNode, function(){
							nodes = makeAndPut(func.call(self), nodes);
						});
						//return parent;
				}) + "></" +tag+">";
			} else if(status === 1){ // in a tag
				// mark at end!
				var attrName = func.call(self).replace(/['"]/g, '').split('=')[0];
				pendingHookups.push(function(el) {
					liveBind(observed, el, function() {
						var attr = func.call(self),
							parts = (attr || "").replace(/['"]/g, '').split('='),
							newAttrName = parts[0];
						
						// remove if we have a change and used to have an attrName
						if((newAttrName != attrName) && attrName){
							el.removeAttribute(attrName)
						}
						// set if we have a new attrName
						if(newAttrName){
							el.setAttribute(newAttrName, parts[1])
						}
					});
				});

				return input;
			} else { // in an attribute
				pendingHookups.push(function(el){
					var wrapped = can.$(el),
						hooks;
						
					(hooks = can.data(wrapped,'hooks')) || can.data(wrapped, 'hooks', hooks = {});
					var attr = el.getAttribute(status),
						parts = attr.split("__!!__"),
						hook;

					if(hooks[status]) {
						hooks[status].funcs.push(func);
					}
					else {

						hooks[status] = {
							render: function() {
								var i =0,
									newAttr = attr.replace(attributeReplace, function() {
										return contentText( hook.funcs[i++].call(self) );
									});
								return newAttr;
							},
							funcs: [func],
							batchNum : undefined
						};
					}
					hook = hooks[status];
					
					parts.splice(1,0,input);
					el.setAttribute(status, parts.join(""));
					

					liveBind(observed, el, function(ev) {
						if(ev.batchNum === undefined || ev.batchNum !== hook.batchNum){
							hook.batchNum = ev.batchNum;
							el.setAttribute(status, hook.render());
						} 
						
						
					});
				})
				return "__!!__";
			}
		},
		// called to setup escaped text
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
	// ========= SCANNING CODE =========
	var tokenReg = new RegExp("(" +["<%%","%%>","<%==","<%=","<%#","<%","%>","<",">",'"',"'"].join("|")+")"),
		// commands for caching
		startTxt = 'var ___v1ew = [];',
		finishTxt = "return ___v1ew.join('')",
		put_cmd = "___v1ew.push(",
		insert_cmd = put_cmd,
		// global controls (used by other functions to know where we are)
		// are we inside a tag
		htmlTag =null,
		// are we within a quote within a tag
		quote = null,
		// what was the text before the current quote (used to get the attr name)
		beforeQuote = null,
		// used to mark where the element is
		status = function(){
			// t - 1
			// h - 0
			// q - string beforeQuote
			return quote ? "'"+beforeQuote.match(attrReg)[1]+"'" : (htmlTag ? 1 : 0)
		},
		pendingHookups = [],
		rsplit = function( string, regex ) {
			var result = regex.exec(string),
				retArr = [],
				first_idx, last_idx;
			while ( result !== null ) {
				first_idx = result.index;
				last_idx = regex.lastIndex;
				if ( first_idx !== 0 ) {
					retArr.push(string.substring(0, first_idx));
					string = string.slice(first_idx);
				}
				retArr.push(result[0]);
				string = string.slice(result[0].length);
				result = regex.exec(string);
			}
			if ( string !== '' ) {
				retArr.push(string);
			}
			return retArr;
		},
		scan = function(source, name){
			var tokens = rsplit(source.replace(newLine, "\n"), tokenReg), 
				content = '',
				buff = [startTxt],
				// helper function for putting stuff in the view concat
				put = function( content, bonus ) {
					buff.push(put_cmd, '"', clean(content), '"'+(bonus||'')+');');
				},
				// a stack used to keep track of how we should end a bracket }
				// once we have a <%= %> with a leftBracket
				// we store how the file should end here (either '))' or ';' )
				endStack =[],
				// the last token, used to remember which tag we are in
				lastToken,
				// the corresponding magic tag
				startTag = null,
				// was there a magic tag inside an html tag
				magicInTag = false,
				// the current tag name
				tagName = '',
				// declared here
				bracketCount,
				i = 0,
				token;

			// re-init the tag state goodness
			htmlTag = quote = beforeQuote = null;

			for (; (token = tokens[i++]) !== undefined;) {

				if ( startTag === null ) {
					switch ( token ) {
					case '<%':
					case '<%=':
					case '<%==':
						magicInTag = 1;
					case '<%#':
						// a new line, just add whatever content w/i a clean
						// reset everything
						startTag = token;
						if ( content.length > 0 ) {
							put(content);
						}
						content = '';
						break;

					case '<%%':
						// replace <%% with <%
						content += '<%';
						break;
					case '<':
						// make sure we are not in a comment
						if(tokens[i].indexOf("!--") !== 0) {
							htmlTag = 1;
							magicInTag = 0;
						}
						content += token;
						break;
					case '>':
						htmlTag = 0;
						// TODO: all <%= in tags should be added to pending hookups
						if(magicInTag){
							put(content, ",can.EJS.pending(),\">\"");
							content = '';
						} else {
							content += token;
						}
						
						break;
					case "'":
					case '"':
						// if we are in an html tag, finding matching quotes
						if(htmlTag){
							// we have a quote and it matches
							if(quote && quote === token){
								// we are exiting the quote
								quote = null;
								// otherwise we are creating a quote
								// TOOD: does this handle "\""
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
					//we have a start tag
					switch ( token ) {
					case '%>':
						// %>
						switch ( startTag ) {
						case '<%':
							// <%
							
							// get the number of { minus }
							bracketCount = bracketNum(content);
							
							// we are ending a block
							if (bracketCount == 1) {
								// we are starting on
								buff.push(insert_cmd, "can.EJS.txt('"+tagName+"'," + status() + ",this,function(){", startTxt, content);
								
								endStack.push({
									before: "",
									after: finishTxt+"}));"
								})
							}
							else {
								
								// how are we ending this statement
								var last = // if the stack has value and we are ending a block
									 endStack.length && bracketCount == -1 ? // use the last item in the block stack
									 endStack.pop() : // or use the default ending
								{
									after: ";"
								};
								
								// if we are ending a returning block
								// add the finish text which returns the result of the
								// block 
								if (last.before) {
									buff.push(last.before)
								}
								// add the remaining content
								buff.push(content, ";",last.after);
							}
							break;
						case '<%=':
						case '<%==':
							// - we have an extra { -> block
							// get the number of { minus } 
							bracketCount = bracketNum(content);
							// if we have more {, it means there is a block
							if( bracketCount ){
								// when we return to the same # of { vs } end wiht a doubleParen
								endStack.push({
									before : finishTxt,
									after: "}));"
								})
							} 
							// check if its a func like ()->
							if(quickFunc.test(content)){
								var parts = content.match(quickFunc)
								content = "function(__){var "+parts[1]+"=can.$(__);"+parts[2]+"}"
							}
							
							// if we have <%== a(function(){ %> then we want
							//  can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];
							buff.push(insert_cmd, "can.EJS."+(startTag === '<%=' ? "esc" : "txt")+"('"+tagName+"'," + status()+",this,function(){ return ", content, 
								// if we have a block
								bracketCount ? 
								// start w/ startTxt "var _v1ew = [];"
								startTxt : 
								// if not, add doubleParent to close push and text
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
			
			// put it together ..
			
			if ( content.length > 0 ) {
				// Should be content.dump in Ruby
				put(content)
			}
			buff.push(";")
			var template = buff.join(''),
				out = {
					out: 'with(_VIEW) { with (_CONTEXT) {' + template + " "+finishTxt+"}}"
				};
			//use eval instead of creating a function, b/c it is easier to debug
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
			return $View(url, data || this._data, helpers || this._extras); //new EJS(options).render(data, helpers);
		},
		list : function(list, cb){
			list.attr('length')
			for(var i = 0, len = list.length; i < len; i++){
				cb(list[i], i, list)
			}
		}
	};

	// options for steal's build
	can.view.register({
		suffix: "ejs",
		//returns a function that renders the view
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
