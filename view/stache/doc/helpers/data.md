@function can.stache.helpers.data {{data name}}
@parent can.stache.htags 7
@signature `{{data name[ context]}}`

Adds the current [can.stache.context context] to the
element's [can.data].

@param {String} name The name of the data attribute to use for the
context.

@body

## Use

It is common to want some data in the template to be available
on an element.  `{{data name}}` allows you to save the
context so it can later be retrieved by [can.data] or
`$.fn.data`. For example,

The template:

    <ul>
      <li id="person" {{data 'person'}}>{{person.name}}</li>
    </ul>

Rendered with:

    document.body.appendChild(
      can.stache(template,{ person: { name: 'Austin' } });

Retrieve the person data back with:

    $("#person").data("person")

### Changing the context

In Stache templates it is possible to explicitly set the context by passing 
a context as the second argument to the data helper: `{{data name context}}`.

The template:

    <ul>
      <li id="person" {{data 'person' person2}}>{{person2.name}}</li>
    </ul>

Rendered with:

    document.body.appendChild(
      can.stache(template,{ 
        person: { name: 'Austin' },
        person2: { name: 'Leah' }
    );

Retrieve the person data back with:

    $("#person").data("person") // --> { name: 'Leah' )
