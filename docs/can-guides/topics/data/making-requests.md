@page guides/data-making-requests Making requests
@parent guides/data-extreme
@outline 3

@description URL, query, and response formats for making requests.

@body

## Note to reader
 
The **Data guide** and its sub-sections are a work in progress and are currently under review. The information provided is accurate, however, it will likely undergo several rounds of revision before being formerly published. Feel free to go through these sections to learn about how data-modeling works, and please leave any comments in [this Google Doc](https://docs.google.com/document/d/1Ins62Zr-rIgBHCpfIZ-VHJKrxCjmOz1rZmUSP_a6shA/edit?usp=sharing).

## Overview

This document describes how to configure [can-connect] for loading model data from a remote server. Every model in your application will have its own connection, and each connection will be able to Create, Read, Update, and Delete (CRUD) model data from the server. There are two sections of this document: 

1. [Part 1 - Making requests](#making-requests) - configuring your connection for outgoing requests
2. [Part 2 - Handling the response](#managing-response-data) - parsing and formatting response data for use within your app

<a name="making-requests"></a>
## Part 1 - Making requests

When configuring a connection, the [can-connect/data/url/url data-url behavior] is responsible for making AJAX requests, and this behavior expects the URLs and data to be formatted a certain way. If your services do not line up with what is expected, we will describe how to configure things to meet your needs.

> Note: all examples will be using the [can-rest-model] as it serves as a good starting point for learning how to use [can-connect]. For those familiar with [`can.Model`](https://v2.canjs.com/docs/can.Model.html), the `can-rest-model` is essentially the next generation.

### Understanding the [can-connect/DataInterface]

Each of the CRUD operations maps to one of the functions descibed by the [can-connect/DataInterface]. The `DataInterface` is a lower level interface used for loading **raw data** from a remote data source. This is not the same as the [can-connect/InstanceInterface] which deals with typed data. Understanding the raw `DataInterface` is crucial for making the customizations described below. 

> **IMPORTANT:** Whenever loading data within your application, you almost always want to use the [can-connect/InstanceInterface]. The lower level `DataInterface` should be used for customizing how raw data is loaded .

- **`[can-connect/connection.getListData]`** - loads a list of records (with optional filtering, sorting, and pagination)
- **`[can-connect/connection.getData]`** - loads an individual record by `[can-reflect.getIdentity {id}]`
- **`[can-connect/connection.createData]`** - creates a new record
- **`[can-connect/connection.updateData]`** - updates an existing record by `[can-reflect.getIdentity {id}]`
- **`[can-connect/connection.destroyData]`** - deletes a record by `[can-reflect.getIdentity {id}]`


### Configuring the URL

When configuring a connection with the [can-connect/data/url/url data-url behavior], a single URL can be used to describe all CRUD endpoints.

```js
const connection = restModel({
  url: "/api/todos/{id}"
});
```

The above is equivalent to the following long-hand configuration:

```js
const connection = restModel({
  url: {
    getData:     "GET /api/todos/{id}",
    getListData: "GET /api/todos",
    createData:  "POST /api/todos",
    updateData:  "PUT /api/todos/{id}",
    destroyData: "DELETE /api/todos/{id}",
  }
});
```

**Here is a working example you can play with in your browser:**

```js
import { restModel } from "can";
import { Todo, todoFixture } from "//unpkg.com/can-demo-models@5";

// create mock data
todoFixture(5);

// define the connection
const connection = restModel({
  url: "/api/todos/{id}",
  Map: Todo
});

// load data
connection.getList({}).then(todos => {
  console.log(todos);
});
```
@codepen

> NOTE: For more information, read about the [can-connect/data/url/url data-url behavior], the [can-connect/data/url/url.url url configuration], and the [can-connect/DataInterface].


### Customizing the request method and URL

Some applications will not follow the conventions expected by the [can-connect/data/url/url data-url behavior]. For example an application might only support `GET` and `POST` request methods or might use a unique URL structure. You can configure individual CRUD endpoints by defining the method and URL for each endpoint:

```js
const connection = restModel({
  url: {
    getListData: 'GET /api/todos/all',
    getData:     'GET /api/todo?uuid={id}',
    createData:  'POST /api/todo/create',
    updateData:  'POST /api/todo/update?uuid={id}',
    destroyData: 'POST /api/todo/delete?uuid={id}',
  }
});
```

### Implementing the DataInterface yourself
    
Consider a situation where an application loads all incomplete TODOs from a special URL like `/api/todos/incomplete`. In such cases, you can write a custom [can-connect/data/url/url.getListData getListData] function which performs the actual ajax request. You can implement any of the [can-connect/DataInterface] methods in a similar way:

```js
import ajax from 'can-ajax';

const connection = restModel({
  url: {
    getListData(query) {
      if(query.filter.complete === false) {
        // Load all incomplete TODOs from a separate URL
        return ajax({ url: '/api/todos/incomplete', data: query, ... });
      }
      
      // Load all other TODOs from the primary URL
      return ajax({ url: '/api/todos', data: query, ... });
    }
  }
});
    
// Loads incomplete TODOs from '/api/todos/incomplete'
connection.getList({ complete: false });
    
// Loads all TODOs from '/api/todos'
connection.getList({});
```

### Customizing the AJAX data transport

By default, [can-ajax] is used to make all data requests using XMLHttpRequest (XHR) and is based on the [`jQuery.ajax`](http://api.jquery.com/jquery.ajax/) interface. Any jQuery compatible transport can serve as a drop-in replacement for `can-ajax`. Here is how you would use jQuery's ajax transport for all requests:

```js
import $ from "jquery";

const connection = restModel({
  url: "/api/todos/{id}",
  ajax: $.ajax
});
```

#### Using another library for AJAX requests

You can create a thin wrapper to translate the `ajaxOptions` expected by [can-ajax] into options for another library. For example, here is how you could use [axios](https://github.com/axios/axios) with can-connect:

```js
import axios from 'axios';

function axiosTransport({ url, type, data, dataType }) {
	const hasBody = /POST|PUT|PATCH/i.test(type);

	// Must return a Promise
	return axios({
		url,
		method: type,
		params: hasBody ? {} : data,
		data: hasBody ? data : {},
		responseType: dataType || 'json',
	}).then(res => {
		// Must resolve to the parsed data object
	   return (typeof res === 'string') ? JSON.parse(res) : res;
	});
}

const connection = restModel({
    url: "/api/todos",
    ajax: axiosTransport
});
```

> Note: Any data transport can be used so long as it can conform to the [can-ajax] interface, which is based on the [`jQuery.ajax`](http://api.jquery.com/jquery.ajax/) interface.

### Creating your own data-url behavior

In really advanced situations, you can create your own custom `data-url` behavior for making AJAX requests. You will need to implement the required [can-connect/DataInterface] methods described above. Every method must return a Promise which resolves to the expected data:

```js
connect.behavior("data/url", function( baseConnection ) {
  return {
    getListData(query) {
      return ajax({
        type: "GET",
        url: this.url,
        data: query
      });
    },
    getData(query) { return ajax(...) },
    createData(data) { return ajax(...) },
    updateData(data) { return ajax(...) },
    destroyData(data) { return ajax(...) }
  };
});
```

### Loading list data 

Loading list data is unique because data can be filtered, sorted, and paginated using [can-query-logic]. This is where the real power of [can-connect] becomes available as it enables advanced behaviors such as the [can-connect/constructor/store/store constructor store], [can-connect/real-time/real-time real-time updates], caching, and other goodness. We recommend reading the following documents to become familiar with how to query logic works:

- The the comprehensive guide on [can-query-logic]
- Learn about the [can-query-logic/query query structure]
- Check out the available [can-query-logic/comparison-operators comparison operators] used for filtering data

<a name="managing-response-data"></a>
## Part 2 - Parsing, formatting, and managing response data

Once raw data is loaded from a server, that data needs to be instantiated into typed data for use within your applicaiton. The [can-connect/constructor/constructor constructor behavior] is responsible for instantiating data returned from your services, and this behavior expects data to be formatted a certain way. If your services do not return data in the expected format, we will describe how to configure things to meet your needs.


### Understanding how `can-connect` manages Model instances

Many of the behaviors available with [can-connect] are designed to work with instances of Model data for your application. A single [can-connect/constructor/store/store] is used to keep references to instance data and prevent multiple copies of an instance from being used by the application at once. 

For example, if you have 3 different components which display information about the currently logged in `User`, you can rest easy knowing that all 3 components will receive the same exact instance of that user. If the user gets updated by one component, all other components will receive those updates thanks to the [can-connect/real-time/real-time real-time behavior].


### Customizing how response data his handled

There are two types of response formats expected by the [can-connect/constructor/constructor constructor behavior]: 

- **Instance Data:** - The result of most CRUD operations. The full response body is treated as the instance data.

    ```json
    {
      id: 111,
      name: 'Justin',
      email: ...
    }
    ```
    
- **List Data:** The result of a a call to `getList`. An array of instance data must be on a `data` property in the response body.

    ```json
    {
      count: 3,
      data: [
        { id: 111, name: 'Justin', ...},
        { id: 222, name: 'Brian', ...},
        { id: 333, name: 'Paula', ...}
      ]
    }
    ```

If your services return data in a format which is not expected, the following configurations can be used to customize how data is read and parsed from a response:

- `[can-connect/data/parse/parse.parseInstanceProp]` - a custom property for looking up instance data
- `[can-connect/data/parse/parse.parseListProp]` - a custom property for looking up list data
- `[can-connect/data/parse/parse.parseInstanceData]` - a function for formatting response data
- `[can-connect/data/parse/parse.parseListData]` - a function for formatting response data
