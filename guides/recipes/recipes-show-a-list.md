@page ShowAList Show a List in a Template
@parent Recipes 3

@body

To make an Array observable, pass it to [can.List](../docs/can.List.html).

```
var people = new can.List([
	{firstname: "John", lastname: "Doe"},
	{firstname: "Emily", lastname: "Dickinson"}
]);

var frag = can.view("app-template", {people: people})
$("#my-app").html(frag);
```

To show a list of data within a mustache template, use the `#each` operator.

```
<ul>
{{#each people}}
  <li>
	{{lastname}}, {{firstname}}
  </li>
{{/each}}
</ul>
```

Inside the `#each` block, the attributes are scoped to individual
objects in the list of `people`.

To make changes to the list, use an Array method such as
[push](/docs/can.List.prototype.push.html)
or [pop](/docs/can.List.prototype.pop.html).

```
// adds a new person
people.push({firstname: "Paul", lastname: "Newman"})
// removes the last person
people.pop()
```

<iframe width="100%" height="300" src="http://jsfiddle.net/donejs/Pgbpa/embedded/result,html,js/" allowfullscreen="allowfullscreen" frameborder="0"> </iframe>