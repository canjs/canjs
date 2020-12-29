# can-make-rest

[![Build Status](https://travis-ci.org/canjs/can-make-rest.png?branch=master)](https://travis-ci.org/canjs/can-make-rest) [![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-make-rest.svg)](https://greenkeeper.io/)

Make restful urls and methods from a resource.  

## `makeRest( resourceUrl[, uniqueProperty])`


Provide it an "items" resource url and the unique property name and it returns an object with
CRUD HTTP methods and templated urls.

```js
makeRest( "/todos", "ID" ); //=> {
//    getData: {method:"GET", url: "/todos/{ID}"},
//    getListData: {method:"GET", url: "/todos"},
//    createData: {method:"POST", url: "/todos"},
//    updateData: {method:"PUT", url: "/todos/{ID}"},
//    destroyData: {method:"DELETE", url: "/todos/{ID}"}
//  }
```

If a templated "item" resource URL is provided, it will be able to infer the unique property name.

```js
makeRest( "/todos/{_id}" ); //=> {
//    getData: {method:"GET", url: "/todos/{_id}"},
//    getListData: {method:"GET", url: "/todos"},
//    createData: {method:"POST", url: "/todos"},
//    updateData: {method:"PUT", url: "/todos/{_id}"},
//    destroyData: {method:"DELETE", url: "/todos/{_id}"}
//  }
```
