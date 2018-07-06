@page guides/logic Logic
@parent guides/essentials 5
@outline 2
@hide

@description Learn how to write observables in an organized, testable, and maintainable way.


> NOTE: This guide is in-progress and is mostly notes on what
> a future guide should look like.  If you have suggestions, please
> add them to [this issue](https://github.com/canjs/canjs/issues/4266).

## Organization

I usually organize my view model code as follows:

```js
import {Component} from "can";

Component.extend({
    tag: "some-component",
    view: `...`,
    ViewModel: {
        // EXTERNAL STATEFUL PROPERTIES
        // These are properties passed from another component.
        todoId: "number",

        // INTERNAL STATEFUL PROPERTIES
        // These are properties that are owned by this component.
        isEditing: {type: "boolean", default: false}

        // DERIVED PROPERTIES
        get something(){ ... }


        // METHODS
        updateTodo(){
            this.dispatch("updateTodo")
        }

        connectedCallback(element){
            // SIDE EFFECTS
            // if `connectedCallback()` isn't called ... then no side effects,
            // you can test yourself
            this.listenTo("updateTodo", function(){
                new Todo().save();
            })
        }    
    }

})
```

## Dispatching
