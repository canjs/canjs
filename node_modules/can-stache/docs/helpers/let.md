@function can-stache.helpers.let let
@parent can-stache.htags


@description Create a block-level variable.

@signature `{{ let VARIABLE_NAME=VALUE [,HASHES] }}`

The `let` helper allows you to create a variable local to the template.

The following creates a `first` and `last` helper that reference
the ViewModel's `name.first` and `name.last` value:

```html
<let-example></let-example>
<script type="module">
import {StacheElement} from "can";

class LetExample extends StacheElement {
  static view = `
    {{let first=this.name.first, last=this.name.last}}
    <p>First: {{first}}, Last: {{last}}</p>
  `;

  static props = {
    user: {
      get default() {
        return {
          name: {
            first: "Justin",
            last: "Meyer"
          }
        };
      }
    }
	};
}

customElements.define("let-example", LetExample);
</script>
```

`let` must be followed by keys and values.  The following is valid:

```html
{{ let varA=this.propA, varB=null, varC=undefined }}
```

But the following (currently) is not:

```html
{{ let varA, varB }}
```

If you want to create two undefined variables, you must (currently) do so like:

```html
{{ let varA=undefined, varB=undefined }}
```

@signature `{{# let VARIABLE_NAME=VALUE [,HASHES] }}FN{{/ let}}`

Allows to create a variable local to the template multiple times.

The following creates `name` variable two times, a different value is referenced each time.

```html
<script type="module">

import {StacheElement} from "can";

class MyApp extends StacheElement {
  static view = `
    {{# let name="Cherif" }}
      <div> Customer: {{name}} </div>
    {{/ let }}

    {{# let name="XBox" }}
      <div> Product: {{name}} </div>
    {{/ let }}
  `;
}

customElements.define("my-app", MyApp);
</script>
```

@body


## Use

`let` creates "block-level" variables similar to JavaScript's [let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
statement.

Currently, it can only create variables for the template and within [can-stache.helpers.for-of].  For example,
the following adds variables to the template:

```html
<let-example></let-example>
<script type="module">
import {StacheElement} from "can";

class LetExample extends StacheElement {
  static view = `
    {{let first=this.name.first, last=this.name.last}}
    <p>First: {{first}}, Last: {{last}}</p>
  `;

  static props = {
    user: {
      get default() {
        return {
          name: {
            first: "Justin",
            last: "Meyer"
          }
        };
      }
    }
  };
}

customElements.define("let-example", LetExample);
</script>
```


The following creates a `first` and `last` that are only available within the `{{# for(...) }}`-`{{/ for}}`
block:


```html
<for-let-example></for-let-example>
<script type="module">
import {StacheElement} from "can";

class ForLetExample extends StacheElement {
  static view = `
    {{# for(user of this.users) }}
      {{let first=user.name.first, last=this.name.last}}
      <p>First: {{first}}, Last: {{last}}</p>
    {{/ for}}
  `;

  static props = {
    users: {
      get default() {
        return [
          { name: { first: "Justin", last: "Meyer" } },
          { name: { first: "Ramiya", last: "Meyer" } }
        ];
      }
    }
  };
}

customElements.define("for-let-example", ForLetExample);
</script>
```


Currently, `let` is not supported within other blocks.
