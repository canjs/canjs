var $ = require("funcunit/browser/jquery");
var FuncUnit = require("funcunit/browser/core");
var syn = window.syn = require("syn");

/**
 * @add FuncUnit
 */
var clicks = [
// methods
/**
   *
 * @function FuncUnit.prototype.click .click()
   * @parent actions
   * @signature `click(options [,success])`
   *
 * Clicks an element.  This uses [syn.prototype.click] to issue a:
 * <ul>
 * 	<li><code>mousedown</code></li>
 *  <li><code>focus</code> - if the element is focusable</li>
 *  <li><code>mouseup</code></li>
 *  <li><code>click</code></li>
 * </ul>
 * If no clientX/Y or pageX/Y is provided as options, the click happens at the
 * center of the element.
 * <p>For a right click or double click use [FuncUnit.prototype.rightClick] or
 *   [FuncUnit.prototype.dblclick].</p>
 * <h3>Example</h3>
 * 
 * @codestart
 * //clicks the bar element
 *F("#bar").click()
 * @codeend
 * @param {Object} [options] options to pass to the click event.  Typically, this is clientX/Y or pageX/Y:
 * 
 * @codestart
 * $('#foo').click({pageX: 200, pageY: 100});
 * @codeend
 * You can pass it any of the serializable parameters you'd send to
 * [http://developer.mozilla.org/en/DOM/event.initMouseEvent initMouseEvent], but command keys are
 * controlled by [FuncUnit.prototype.type].
   *
 * @param {Function} [success] a callback that runs after the click, but before the next action.
 * @return {funcUnit} returns the funcunit object for chaining.
 */
'click',
/**
   * @function FuncUnit.prototype.dblclick .dblclick()
   * @parent actions
   * @signature `dblclick(options [,success])`
   *
 * Double clicks an element by [FuncUnit.prototype.click clicking] it twice and triggering a dblclick event.
 * @param {Object} options options to add to the mouse events.  This works
 * the same as [FuncUnit.prototype.click]'s options.
 * @param {Function} [success] a callback that runs after the double click, but before the next action.
 * @return {funcUnit} returns the funcunit object for chaining.
 */
'dblclick',
/**
   * @function FuncUnit.prototype.rightClick .rightClick()
   * @parent actions
   * @signature `rightClick(options [,success])`
 * Right clicks an element.  This typically results in a contextmenu event for browsers that
 * support it.
 * @param {Object} options options to add to the mouse events.  This works
 * the same as [FuncUnit.prototype.click]'s options.
 * @param {Function} [success] a callback that runs after the click, but before the next action.
 * @return {funcUnit} returns the funcunit object for chaining.
 */
'rightClick'],
  makeClick = function(name){
    FuncUnit.prototype[name] = function(options, success){
      this._addExists();
      if(typeof options == 'function'){
        success = options;
        options = {};
      }
      var selector = this.selector;
      FuncUnit.add({
        method: function(success, error){
          options = options || {};
          syn("_" + name, this.bind[0], options, success);
        },
        success: success,
        error: "Could not " + name + " '" + this.selector+"'",
        bind: this,
        type: "action"
      });
      return this;
    }
  }

for(var i=0; i < clicks.length; i++){
  makeClick(clicks[i])
}

$.extend(FuncUnit.prototype, {
  // perform check even if last queued item is a wait beacuse certain waits don't guarantee the element is visible (like text)
  _addExists: function(){
    this.exists(false);
  },
  /**
       * @function FuncUnit.prototype.type .type()
       * @parent actions
       * @signature `type(text [,success])`
       *
   * Types text into an element.  This makes use of [syn.type] and works in
   * a very similar way.
   * <h3>Quick Examples</h3>
	 * 
   * @codestart
   * //types hello world
   *F('#bar').type('hello world')
   *
   * //submits a form by typing \r
   *F("input[name=age]").type("27\r")
   *
   * //types FuncUnit, then deletes the Unit
   *F('#foo').type("FuncUnit\b\b\b\b")
   *
   * //types JavaScriptMVC, then removes the MVC
   *F('#zar').type("JavaScriptMVC[left][left][left]"+
   *                      "[delete][delete][delete]")
   *
   * //types JavaScriptMVC, then selects the MVC and
   * //deletes it
   *F('#zar').type("JavaScriptMVC[shift]"+
   *                "[left][left][left]"+
   *                "[shift-up][delete]")
   * @codeend
   *
   * <h2>Characters</h2>
   *
   * For a list of the characters you can type, check [syn.keycodes].
   *
   * @param {String} text the text you want to type
   * @param {Function} [success] a callback that is run after typing, but before the next action.
   * @return {FuncUnit} returns the funcUnit object for chaining.
   */
  type: function( text, success ) {
    this._addExists();
    // when you type in something you have to click on it first
    this.click();
    var selector = this.selector;
    // type("") is a shortcut for clearing out a text input
    if(text === ""){
      text = "[ctrl]a[ctrl-up]\b"
    }
    FuncUnit.add({
      method : function(success, error){
        syn("_type", this.bind[0], text, success);

      },
      success : success,
      error : "Could not type " + text + " into " + this.selector,
      bind : this,
      type: "action"
    });
    return this;
  },
  /**
       * @function FuncUnit.prototype.sendKeys .sendKeys()
       * @parent actions
       * @signature `sendKeys(keys [,success])`
       *
   * Sends keys into an element.  Only difference here from type is 
   * that an implicit click is not performed
   *
   * @param {String} keys the keys you want to send
   * @param {Function} [success] a callback that is run after typing, but before the next action.
   * @return {FuncUnit} returns the funcUnit object for chaining.
   */
  sendKeys: function( keys, success ) {
    this._addExists();
    var selector = this.selector;
    // sendKeys("") is a shortcut for clearing out a text input
    if(keys === ""){
      keys = "[ctrl]a[ctrl-up]\b"
    }
    FuncUnit.add({
      method : function(success, error){
        syn("_type", this.bind[0], keys, success);

      },
      success : success,
      error : "Could not send the keys " + keys + " into " + this.selector,
      bind : this,
      type: "action"
    });
    return this;
  },
  // TODO (DL) this needs to be deprecated this advertises .trigger() functionality
  // but expects that the target page will have jQuery which could not be the case.
  trigger: function(evName, success){
    this._addExists();
    FuncUnit.add({
      method : function(success, error){
        // need to use the page's jquery to trigger events
        if(!FuncUnit.win.jQuery) {
          throw 'Can not trigger custom event, no jQuery found on target page.';
        }
        FuncUnit.win.jQuery(this.bind.selector).trigger(evName)
        success()
      },
      success : success,
      error : "Could not trigger " + evName,
      bind : this,
      type: "action"
    });
    return this;
  },
  /**
       * @function FuncUnit.prototype.drag .drag()
       * @parent actions
       * @signature `drag(options [,success])`
   * Drags an element into another element or coordinates.
   * This takes the same parameters as [syn.prototype.move move].
   * @param {String|Object} options A selector or coordinates describing the motion of the drag.
   * <h5>Options as a Selector</h5>
   * Passing a string selector to drag the mouse.  The drag runs to the center of the element
   * matched by the selector.  The following drags from the center of #foo to the center of #bar.
	 * 
   * @codestart
   *F('#foo').drag('#bar')
   * @codeend
	 * 
   * <h5>Options as Coordinates</h5>
   * You can pass in coordinates as clientX and clientY:
	 * 
   * @codestart
   *F('#foo').drag('100x200')
   * @codeend
	 * 
   * Or as pageX and pageY
	 * 
   * @codestart
   *F('#foo').drag('100X200')
   * @codeend
	 * 
   * Or relative to the start position
	 * 
	 * @codestart
   *F('#foo').drag('+10 +20')
	 * @codeend
	 * 
   * <h5>Options as an Object</h5>
   * You can configure the duration, start, and end point of a drag by passing in a json object.
	 * 
   * @codestart
   * //drags from 0x0 to 100x100 in 2 seconds
   *F('#foo').drag({
   *   from: "0x0",
   *   to: "100x100",
   *   duration: 2000
   * })
   * @codeend
	 * 
   * @param {Function} [success] a callback that runs after the drag, but before the next action.
   * @return {funcUnit} returns the funcunit object for chaining.
   */
  drag: function( options, success ) {
    this._addExists();
    if(typeof options == 'string'){
      options = {to: options}
    }
    options.from = this.selector;

    var selector = this.selector;
    FuncUnit.add({
      method: function(success, error){
        syn("_drag", this.bind[0], options, success);
      },
      success: success,
      error: "Could not drag " + this.selector,
      bind: this,
      type: "action"
    })
    return this;
  },
  /**
       * @function FuncUnit.prototype.move .move()
       * @parent actions
       * @signature `move(options [,success])`
   * Moves an element into another element or coordinates.  This will trigger mouseover
   * mouseouts accordingly.
   * This takes the same parameters as [syn.prototype.move move].
   * @param {String|Object} options A selector or coordinates describing the motion of the move.
   * <h5>Options as a Selector</h5>
   * Passing a string selector to move the mouse.  The move runs to the center of the element
   * matched by the selector.  The following moves from the center of #foo to the center of #bar.
	 * 
   * @codestart
   *F('#foo').move('#bar')
   * @codeend
	 * 
   * <h5>Options as Coordinates</h5>
   * You can pass in coordinates as clientX and clientY:
	 * 
   * @codestart
   *F('#foo').move('100x200')
   * @codeend
	 * 
   * Or as pageX and pageY
	 * 
   * @codestart
   *F('#foo').move('100X200')
   * @codeend
	 * 
   * Or relative to the start position 
   * @codestart
   *F('#foo').move('+10 +20') 
   * @codeend
	 * 
   * <h5>Options as an Object</h5>
   * You can configure the duration, start, and end point of a move by passing in a json object.
	 * 
   * @codestart
   * //drags from 0x0 to 100x100 in 2 seconds
   *F('#foo').move({
   *   from: "0x0",
   *   to: "100x100",
   *   duration: 2000
   * })
   * @codeend
	 * 
   * @param {Function} [success] a callback that runs after the drag, but before the next action.
   * @return {funcUnit} returns the funcunit object for chaining.
   */
  move: function( options, success ) {
    this._addExists();
    if(typeof options == 'string'){
      options = {to: options}
    }
    options.from = this.selector;

    var selector = this.selector;
    FuncUnit.add({
      method: function(success, error){
        syn("_move", this.bind[0], options, success);
      },
      success: success,
      error: "Could not move " + this.selector,
      bind: this,
      type: "action"
    });
    return this;
  },
  /**
       * @function FuncUnit.prototype.scroll .scroll()
       * @parent actions
       * @signature `scroll(direction, amount, success)`
   * Scrolls an element in a particular direction by setting the scrollTop or scrollLeft.
   * @param {String} direction "left" or "top"
   * @param {Number} amount number of pixels to scroll
   * @param {Function} success
   */
  scroll: function( direction, amount, success ) {
    this._addExists();
    var selector = this.selector,
      direction;
    if (direction == "left" || direction == "right") {
      direction = "Left";
    } else if (direction == "top" || direction == "bottom") {
      direction = "Top";
    }
    FuncUnit.add({
      method: function(success, error){
        this.bind.each(function(i, el){
          this["scroll" + direction] = amount;
        })
        success();
      },
      success: success,
      error: "Could not scroll " + this.selector,
      bind: this,
      type: "action"
    });
    return this;
  }
});

module.exports = FuncUnit;
