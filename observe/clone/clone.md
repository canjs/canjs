@page can.Observe.Clone clone
@parent can.Observe.plugins
@plugin can/observe/clone
@test can/observe/clone/test.html

The __clone__ plugin allows you to make a temporary copy of a  
[can.Observe Observe] whose changed properties can be later merged
back into the original.

Clone any existing observe with
<code>[can.Observe::clone clone]\(deep\)</code> :
 - set __deep__ to __true__ if you want to make clones out of all nested [can.Observe Observes], __false__ or __undefined__ to leave nested [can.Observe Observes] as is.

The new [can.Observe.Clone Clone] observe has the same prototype and class
properties as the original, as well as a <code>[can.Observe.Clone::merge merge]()</code>
function that will merge all of the [can.Observe.Clone Clone's] 

    // create an observable
    var observe = new can.Observe({
      name : "Justin Meyer"
      , awesomeness : 9
    })
    var clone = observe.clone();
    //original will not be changed yet
    clone.attr("name", "Mustin Jeyer");
    clone.name //-> "Mustin Jeyer"

    observe.name //-> "Justin Meyer"
    observe.attr("awesomeness", 10); //will not be overwritten if not explicitly set by clone

    clone.merge();

    observe.name //-> "Mustin Jeyer"
    observe.awesomeness //-> 10
 
If the original [can.Observe Observe] is a [can.Model Model] instance, the 
[can.Observe.Clone Clone] overrides <code>[can.Model::save save]()</code> to write itself to
the server and, on success, merge the result back into the original instance.

    var model = new can.Model({ foo : "bar" });
    var model_clone = model.clone();
    model_clone.attr("foo", "baz").save().done(function() {
      model.foo //-> "baz"
    })
 
