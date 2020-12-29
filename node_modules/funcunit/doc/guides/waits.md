@page Guides.waits Waits
@parent Guides 7

@body
Wait commands are used to check conditions of your page. The test checks a condition repeatedly 
until its either true or a timeout period is reached.

## Wait commands

Wait commands are overloaded jQuery methods.  Just like jQuery methods are both setters and 
getters, depending on how many arguments are passed, FuncUnit wait commands are either waits or 
getters depending on arguments.

### Single argument waits

Most wait commands only require a single argument.

<code>wait( checkVal, [timeout], [callback], [message] )</code>

- [FuncUnit.prototype.size size](../docs/FuncUnit.prototype.size.html)
- [FuncUnit.prototype.html html](../docs/FuncUnit.prototype.html.html)
- [FuncUnit.prototype.text text](../docs/FuncUnit.prototype.text.html)
- [FuncUnit.prototype.val val](../docs/FuncUnit.prototype.val.html)
- [FuncUnit.prototype.offset offset](../docs/FuncUnit.prototype.offset.html)
- [FuncUnit.prototype.position position](../docs/FuncUnit.prototype.position.html)
- [FuncUnit.prototype.scrollTop scrollTop](../docs/FuncUnit.prototype.scrollTop.html)
- [FuncUnit.prototype.scrollLeft scrollLeft](../docs/FuncUnit.prototype.scrollLeft.html)
- [FuncUnit.prototype.height height](../docs/FuncUnit.prototype.height.html)
- [FuncUnit.prototype.width width](../docs/FuncUnit.prototype.width.html)
- [FuncUnit.prototype.innerWidth innerWidth](../docs/FuncUnit.prototype.innerWidth.html)
- [FuncUnit.prototype.innerHeight innerHeight](../docs/FuncUnit.prototype.innerHeight.html)
- [FuncUnit.prototype.outerWidth outerWidth](../docs/FuncUnit.prototype.outerWidth.html)
- [FuncUnit.prototype.outerHeight outerHeight](../docs/FuncUnit.prototype.outerHeight.html)

@codestart
// wait until there are 5 .foo elements
F(".foo").size(5)

// wait until .container has 500px height
F(".container").height(500)

// wait until .banner's text is "Done"
F(".banner").text("Done")
@codeend

### Two argument waits

Some jQuery methods accept 2 parameters.  Similarly, those wait methods accept two arguments.

<code>wait( keyVal, checkVal, [timeout], [callback], [message] )</code>

- [FuncUnit.prototype.attr attr](../docs/FuncUnit.prototype.attr.html)
- [FuncUnit.prototype.hasClass hasClass](../docs/FuncUnit.prototype.hasClass.html)
- [FuncUnit.prototype.css css](../docs/FuncUnit.prototype.css.html)

@codestart
// wait until $.data for .foo on the key "count" has 2
F(".foo").data("count", 2)

// wait until .contact has class "bar"
F(".contact").hasClasF("bar", true)

// wait until .container has font-color red
F(".container").csF("font-color", "red")
@codeend

### Zero argument waits

Several wait methods check for existence/visibility of elements. These require zero parameters.

<code>wait( [timeout], [callback], [message] )</code>

- [FuncUnit.prototype.exists exists](../docs/FuncUnit.prototype.exists.html)
- [FuncUnit.prototype.missing missing](../docs/FuncUnit.prototype.missing.html)
- [FuncUnit.prototype.visible visibile](../docs/FuncUnit.prototype.visible.html)
- [FuncUnit.prototype.invisible invisible](../docs/FuncUnit.prototype.invisible.html)

@codestart
// wait until the .foo element is removed
F(".foo").missing();
@codeend

## Tester function

Instead of checking for a simple static value, tests can provide their own tester method. The tester 
method's arguments are whatever the wait normally accepts.  It returns true when the condition is met, 
after which the next wait or action begins.

@codestart
var initialWidth = F("#sliderMenu").width();

// wait until width is at least 200px
F("#sliderMenu").width(function( width ) {
  return width >= 200;
})
@codeend  

The tester method will be called repeatedly until it returns true, or the timeout is reached.

## Timeout

By default, wait commands will wait a 10s timeout period.  If the condition isn't true after that time, 
the test will fail.  

You can provide your own (optional) timeout for each wait condition as the parameter after 
the wait condition.  For example, the following will check if "#trigger" contains "I was triggered" for 
5 seconds before failing the test.

@codestart
("#trigger").text("I was triggered", 5000)
@codeend

The [FuncUnit.timeout] property is a global timeout value.  Its value sets the default timeout if a value isn't 
provided.

## Callback

Another optional parameter for each wait command is a callback method, which runs after the wait completes.

Inside a callback is the place to get information about a page and perform assertions. Callbacks are 
also useful for debugging.

@codestart
F(".foo").text("bar", function(){
  // runs after wait condition completes
})
@codeend

## Message

The last (optional) parameter for each wait command is a message.  By default, wait conditions will pass silently (without a passed assertion).  
If a user provides a message string, the wait condition will pass an assertion with the given message when the wait completes.  If the wait fails 
(the timeout is reached), this message will be provided to the failed assertion.

@codestart
F(".foo").text("bar", "the foo element has text bar")
@codeend
