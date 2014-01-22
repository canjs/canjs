@page RecipesControls Controls
@parent Recipes 0

@body
The following recipes explore making UI widgets with `can.control`.

### Tabs

The following recipes builds a simple tabs widget.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/kXLLt/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

#### How it works

It creates a `Tabs` constructor function that shows and hides tabs
when it's `<li>`'s are clicked.

When `new Tabs()` is called, it adds `active` to the first `<li>`'s 
className. Then, using the `tab` helper function, it hides the content for 
all the other tab buttons.


@codestart
&lt;li>&lt;a href="#model">Model&lt;/a>&lt;/li>
@codeend

Then gets it's `<a>` element, and then uses it's href (`#model`) to get the
content div for that button.

When a button is clicked, `Tabs` listens to it with:

@codestart
"li click" : function( el, ev ) { ... }
@codeend

This function, using the `tab` helper deactivates the active tab button and hides its content, 
then it activates and shows the new tab button and tab content.

### Tooltip

The following recipe builds a simple tooltip.  It shows templated event binding and we will
explain how it keeps memory leaks from happening. Click on one of the items
to see a tooltip, click somewhere else to remove it.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/3wtLW/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>

#### How it works

This creates a `Tooltip` control that when created shows a tooltip.  When a `Tooltip` control
is created, it positions the `Tooltip` element relative to the `relativeTo` option and 
sets its inner html to the `html` option.

The tooltip also listens to clicks on the window.  If the user clicked on something other than the
`relativeTo` element and the tooltip element, it will remove the tooltip from the document.

When an element is removed from the DOM with any controls on it, the control's event handlers
are automatically removed.  Templated event binding lets us listen to events outside 
the element.  `"{window} click"` is a templated event binding.

Events outside an element would normally not be removed, but they are with `can.Control`.

### TreeCombo

Select multiple items in a tree-like structure. This control uses `can.Observe.List` and `can.compute`
in a smart way to manage the state of the widget.

<iframe style="width: 100%; height: 300px" 
        src="http://jsfiddle.net/donejs/XP5pv/embedded/result,html,js,css" 
        allowfullscreen="allowfullscreen" 
        frameborder="0">JSFiddle</iframe>


[How it works](http://bitovi.com/blog/2013/01/weekly-widget-tree-combo.html)
