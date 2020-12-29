@property {String} can-route-pushstate.prototype.root root
@parent can-route-pushstate.prototype

@description Configure the base url that will not be modified.

@option {String} Represents the base url that pushstate will prepend to all
routes.  `root` defaults to: `"/"`.

@body

## Use

By default, a route like:

```js
route.urlData = new RoutePushstate();
route.register( "{type}/{id}" );
```

Matches URLs like:

```
http://domain.com/contact/5
```

But sometimes, you only want to match pages within a certain directory.  For
example, an application that is a filemanager.  You might want to
specify root and routes like:

```js
route.urlData = new RoutePushstate();
route.urlData.root = "/filemanager/";
route.register( "file-{fileId}" );
route.register( "folder-{fileId}" );
```

Which matches URLs like:

```
http://domain.com/filemanager/file-34234
```
