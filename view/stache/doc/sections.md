@page can.stache.Sections Sections
@parent can.stache.pages 2

Sections (`[can.stache.tags.section {{#key}}]` followed by `[can.stache.tags.close {{/key}}]`) have multiple uses 
depending on what type of object is passed to the section. In all cases, using a section will change 
the current [can.stache.context context].

The most basic form of section will simply render a section of code if the key referenced is considered **truthy** (has a value):

	Template:
		Hello!
		{{#person}}
			{{name}}
		{{/person}}

	Data:
		{
			person: {
				name: "Andy"
			}
		}

	Result:
		Hello!
		Andy

Whenever the key doesn't exist or the value is **falsey**, the section won't be rendered:

	Template:
		Hello!
		{{#person}}
			{{name}}
		{{/person}}

	Data:
		{}

	Result:
		Hello!

However, this scenario can be covered through the use of an inverse section 
(`[can.stache.tags.inverse {{^key}}]` followed by `[can.stache.tags.close {{/key}}]`):

	Template:
		Hello!
		{{#person}}
			{{name}}
		{{/person}}
		{{^person}}
			No one is here.
		{{/person}}

	Data:
		{}

	Result:
		Hello!
		No one is here.

## Iteration

There is a special case for sections where the key references an array. In this case, the section iterates 
the entire array, rendering the inner text for each item in the array. Arrays are considered **truthy** if 
they aren't empty. The `{{.}}` tag will reference the current item within the array during iteration (which is 
primarily used when the items in the array are primitives like strings and numbers).

	Template:
		{{#people}}
			{{.}} 
		{{/people}}

	Data:
		{
			people: ["Andy", "Austin", "Justin"]
		}

	Result:
		Andy Austin Justin

Section iteration will re-render the entire section for any change in the list. It is the prefered method to
use when a list is replaced or changing significantly. Whereas [can.stache.helpers.each {{#each key}}] iteration
will do basic diffing and aim to only update the DOM where the change occured. When doing single list item
changes frequently, [can.stache.helpers.each {{#each key}}] iteration is the faster choice.
