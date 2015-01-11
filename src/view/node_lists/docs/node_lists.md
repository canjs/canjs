@property {Object} can.view.nodeLists
@parent can.view.static
Stores hierarchical node references.
## Use
`can.view.nodeLists` is used to make sure "directly nested" live-binding
sections update content correctly.
Consider a template like:
    <div>
    {{#if items.length}}
       Items:
       {{#items}}
          <label></label>
       {{/items}}
    {{/if}}
    </div>
The `{{#if}}` and `{{#items}}` seconds are "directly nested" because
they share the same `<div>` parent element.
If `{{#items}}` changes the DOM by adding more `<labels>`,
`{{#if}}` needs to know about the `<labels>` to remove them
if `{{#if}}` is re-rendered.  `{{#if}}` would be re-rendered, for example, if
all items were removed.
To keep all live-bound sections knowing which elements they are managing,
all live-bound elments are [can.view.nodeLists.register registered] and
[can.view.nodeLists.update updated] when the change.
For example, the above template, when rendered with data like:
    data = new can.Map({
      items: ["first","second"]
    })
This will first render the following content:
    <div>
       <span data-view-id='5'/>
    </div>
When the `5` [can.view.hookup hookup] callback is called, this will register the `<span>` like:
    var ifsNodes = [<span 5>]
    nodeLists.register(ifsNodes);
And then render `{{if}}`'s contents and update `ifsNodes` with it:
    nodeLists.update( ifsNodes, [<"\nItems:\n">, <span data-view-id="6">] );
Next, hookup `6` is called which will regsiter the `<span>` like:
    var eachsNodes = [<span 6>];
    nodeLists.register(eachsNodes);
And then it will render `{{#each}}`'s content and update `eachsNodes` with it:
    nodeLists.update(eachsNodes, [<label>,<label>]);
As `nodeLists` knows that `eachsNodes` is inside `ifsNodes`, it also updates
`ifsNodes`'s nodes to look like:
    [<"\nItems:\n">,<label>,<label>]
Now, if all items were removed, `{{#if}}` would be able to remove
all the `<label>` elements.
When you regsiter a nodeList, you can also provide a callback to know when
that nodeList has been replaced by a parent nodeList.  This is
useful for tearing down live-binding.