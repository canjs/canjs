@typedef {String} can.stache.key key
@parent can.stache.types

A key references a value within the current [can.stache.context context] of a 
template being rendered. In the following example, the 
key is `name`:

    <h1>{{name}}</h1>
    
If this template is rendered with:

    {
      name: "Austin"
    }

The template writes out:

    <h1>Austin</h1>
