@function can-control.extend extend
@parent can-control.static

@signature `Control.extend([staticProperties,] instanceProperties)`

Create a new, extended, control constructor 
function. 

@param {Object} [staticProperties] An object of properties and methods that are added the control constructor 
function directly. The most common property to add is [can-control.defaults].

@param {Object} instanceProperties An object of properties and methods that belong to 
instances of the `Control` constructor function. These properties are added to the
control's `prototype` object. Properties that
look like event handlers (ex: `"{element} click"` or `"{element} li mouseenter"`) are setup
as event handlers.

@return {function(new:can-construct,element,options)} A control constructor function that has been
extended with the provided `staticProperties` and `instanceProperties`.

@body

## Examples

    // Control that writes "hello world"
    HelloWorld = Control.extend({
      init: function(element){
        element.text("hello world")  
      }
    });
    new HelloWorld("#message");
    
    // Control that shows how many times
    // the element has been clicked on
    ClickCounter = Control.extend({
      init: function(){
         this.count = 0;
         this.element.text("click me")
      },
      "{element} click": function(){
         this.count++;
         this.element.text("click count = "+this.count)
      }
    })
    new ClickCounter("#counter");
 
    // Counter that counts a specified event
    // type
    CustomCounter = Control.extend({
      defaults: {
        eventType: "click"
      }
    },{
      init: function(){
        this.count = 0;
        this.element.text(this.options.eventType+" me")
      },
      "{element} {eventType}": function(){
         this.count++;
         this.element.text(this.options.eventType+
           " count = "+
           this.count);
      }
    })
    new CustomCounter("#counter");
    new CustomCounter("#buy",{
      eventType: "mouseenter"
    });
    
