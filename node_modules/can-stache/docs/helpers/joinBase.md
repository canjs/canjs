@function can-stache.helpers.joinBase joinBase
@parent can-stache.htags

@signature `{{joinBase([EXPRESSION...])}}`

Return an application-relative url for a resource.

```html
{{joinBase("hello/", name, ".png")}}
```

@param {can-stache/expressions/key-lookup|can-stache/expressions/call} [EXPRESSION...] Expression or key arguments that reference a value within the current or parent scope.

@body

The `joinBase` helper is used to create urls within your application for static resources, such as images. An example usage:

```html
{{joinBase("hello/", name, ".png")}}
```

Where `name` is a scope value, this might return `http://example.com/app/hello/world.png` if the application is `http://example.com/app`.

The url to join with is determined by the following factors:

* If attempting to load a relative url, such as `{{joinBase("../foo.png")}}` and using StealJS the template’s address will be used as a reference to look up the location.
* If the `can.baseURL` string is set, this will be used.
* If the `System.baseURL` is set, this will be used.
* Lastly we fall back to `location.pathname`.
