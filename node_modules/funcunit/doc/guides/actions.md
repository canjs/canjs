@page Guides.actions Actions
@parent Guides 1

@body
Actions are used to simulate user behavior such as clicking, typing, moving the mouse.

## Commands

 - [FuncUnit.open](../docs/FuncUnit.open.html) - opens a page.
 - [FuncUnit.prototype.click click](../docs/FuncUnit.prototype.click.html) - clicks an element (mousedown, mouseup, click).
 - [FuncUnit.prototype.dblclick dblclick](../docs/FuncUnit.prototype.dblclick.html) - two clicks followed by a dblclick.
 - [FuncUnit.prototype.rightClick rightClick](../docs/FuncUnit.prototype.rightClick.html) - a right mousedown, mouseup, and contextmenu.
 - [FuncUnit.prototype.type type](../docs/FuncUnit.prototype.type.html) - types characters into an element.
 - [FuncUnit.prototype.move move](../docs/FuncUnit.prototype.move.html) - mousemove, mouseover, and mouseouts from one element to another.
 - [FuncUnit.prototype.drag drag](../docs/FuncUnit.prototype.drag.html) - a drag motion from one element to another.
 - [FuncUnit.prototype.scroll scroll](../docs/FuncUnit.prototype.scroll.html) - scrolls an element.

Actions run asynchronously, meaning they do not complete all their events immediately.  
However, each action is queued so that you can write actions (and waits) linearly.

@codestart
F('textarea').click().type("Hello World");
  
F('.resizer').drag("+20 +20");
@codeend

## Common mistake

Almost always before performing an action, you should perform a wait that makes sure the 
element you're operating on is ready.  A common pattern is calling visible before most actions.

@codestart
F(".foo").visible().click()
@codeend

Without waits, tests may intermittently fail because of timing conditions. When click runs, it immediately 
simulates a click on the given element.  Often, tests are triggering app behavior that renders elements 
in the page. If that element isn't present before the action runs, the test will fail.