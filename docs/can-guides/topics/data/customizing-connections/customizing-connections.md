@page guides/data-customizing-connections Customizing Connections
@parent guides/data 4
@outline 3

@description Learn the layers that make up [can-connect] and how to implement custom connection functionality.

@body

## Introduction
CanJS provides several convenient ways of creating service layer interfaces (i.e connections) for your data models (i.e Lists & Maps). These include [can-rest-model], [can-realtime-rest-model] and [can-super-model]. Underneath the surface, these are all just pre-defined sets of the building blocks of [can-connect], ***behaviors***.

These pre-defined sets of ***built-in behaviors*** [guides/data-configuring-requests can be configured to cover many use cases], but developers may need to modify their service integrations more extensively than what's possible with configuration alone. This could be to add new features or integrate with unusual backends not supported by the included behaviors. Deep customization of this sort is accomplished by creating connections that include new ***custom behaviors***. Custom behaviors may [*extend*](#extend) or [*replace*](#implement) the functionality of built-in behaviors. Consequently, authors of custom behaviors need to have good knowledge of the functionality provided by existing behaviors and the points of interaction between them.

This guide covers the knowledge you need to write your own ***custom behaviors***:
- how to implement ***behaviors***, the *layers* of a connection
- the importance of ***behavior ordering***
- the ***interfaces*** and their ***interface methods***, the *extension points* used to implement behaviors

## Interfaces Overview
Interfaces in [can-connect] refer to categorizations of related methods that may be implemented by a behavior. These methods define how the layers (behaviors) of [can-connect] interact with each other, and the public API of the connection. As an example, the [can-connect] "Data Interface" is made up of methods like the following:

<table>
	<thead>
		<tr>
			<th colspan="2">
				Data Interface
			</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>[can-connect/connection.getData <code>getData(query)</code>]</td>
			<td>Fetch the raw data of the persisted instance identified by the query.</td>
		</tr>
		<tr>
			<td>[can-connect/connection.getListData <code>getListData(query)</code>]</td>
			<td>Fetch the raw data of the set of persisted instances identified by the query.</td>
		</tr>
		<tr>
			<td>[can-connect/connection.createData <code>createData(data)</code>]</td>
			<td>Make a request to persist the raw data in the passed argument.</td>
		</tr>
		<tr>
			<td colspan="2">
				... and several others
			</td>
		</tr>
	</tbody>
</table>

Essentially, interfaces are a loose specification of shared "extension points" that are used in the implementation of behaviors. For example, the following shows two behaviors that implement the same extension point differently; one using XHR, another using [`fetch`](https://developer.mozilla.org/en/docs/Web/API/Fetch_API):

@sourceref ./interface.js
@highlight 3,5-20,22-33,only
@codepen  

Considering interfaces are just potential points of extension, an entire interface doesn't need to be implemented for a connection to function. For example, [can-connect/connection.getSets getQueries] isn’t implemented by [can-connect/data/url/url <code>data/url</code>]. Behaviors implement *parts* of an interface.

As an example of how interfaces are used as extension points, the [can-connect/DataInterface <code>Data Interface</code>] defines ~20 methods, but the [can-connect/data/url/url <code>data/url</code>] behavior only [*implements*](#implement) 5 of them. [can-connect/connection.getListData <code>getListData</code>] is one of those 5 methods and its implementation simply makes an HTTP request. The other behaviors in a connection might [*extend*](#extend) [can-connect/data/url/url <code>data/url</code>]'s [can-connect/data/url/url.getListData <code>getListData</code>], possibly to add [can-connect/data/combine-requests/combine-requests request combining] or [can-connect/cache-requests/cache-requests request caching]. Alternatively, other behaviors may implement methods from another interface which [*consume*](#consume) [can-connect/data/url/url.getListData <code>getListData</code>]. A common scenario would be [can-connect/connection.getList <code>getList</code>] from the [can-connect/InstanceInterface <code>Instance Interface</code>], whose implementation would call the [can-connect/connection.getListData <code>getListData</code>] implementation of this connection.

<a id="behaviors-overview"></a>
## Behaviors Overview
Behaviors are the "layers" of [can-connect] connections. A connection is an object with a prototype chain made of behavior instances. The default export of behavior modules are "object extension functions" that add an instance of the behavior to the prototype chain of the passed object instance, and by chaining these functions, connections are built:

@sourceref ./chain.js
@highlight 8-11,13-22,only
@codepen  

Illustrating the prototype chain in the example above:
<div>
<img src="https://docs.google.com/drawings/d/e/2PACX-1vQgK18R6Vw-zfFtQj5LMjb_Pf8PoWJQ9clVECyZ1n4hslYKhzhdrkTJwkXVqaVw7JGMWKfqPye44ezY/pub?w=415&amp;h=609">
</div>

Behaviors can be:
- ***Implementers***: simply implementing interface methods
- ***Consumers***:  using interface methods provided by other behaviors
- ***Extenders***: adding to other behavior's implementations of interface methods

<a id="implement"></a>
To be a method ***implementer***, a behavior just needs to include that method as part of their definition. The following implements [can-connect/connection.getListData <code>getListData</code>]:

@sourceref ./implement.js
@highlight 4-15,only
@codepen     

Being a method ***consumer*** just means calling a method on the connection. Here the behavior is consuming the [can-connect/data/url/url.getData <code>getData</code>] method:

@sourceref ./consume.js
@highlight 18-29,only
@codepen   

<a id="extend"></a>
***Extending*** is a bit more complicated. Property access on a connection works like any ordinary JavaScript object, the property is first searched for on the "base" object instance, before searching up the objects on the base object's prototype chain. Since behaviors are instances on that chain, a behavior can override an implementation of a method from a behavior higher in the prototype chain. That feature, with behaviors being able to reference the prototype higher than them in the chain, is what allows them to extend interface methods. This is done by overriding a method and calling the previous implementation as part of that overriding implementation. The following extends [can-connect/data/url/url.getData <code>getData</code>] to add some logging:

@sourceref ./extend.js
@highlight 18-32, only
@codepen

### Calling From Root vs Calling On Previous Behavior

As we've explained, ***extender*** and ***consumers*** both make calls to interface methods within the connection, but there's a distinction regarding *how* they make those calls that's worth highlighting. Typically when ***consumers*** call an interface method they call it on the connection object, which looks like `this.getData()`. That causes a lookup for [can-connect/connection.getData <code>getData</code>] starting at the "root" of the connection prototype chain. In contrast, when an ***extender*** calls the method they're extending, they call it on the behavior above them in the prototype chain e.g `previousBehavior.getData()`. This causes a lookup on the portion of the prototype chain higher than the current behavior.

## Interface Index

A listing of the interfaces of [can-connect] and their most commonly used methods:

<style>
table {

}
td, th {
  text-align: left;
	padding: 1em;
}
td:first-child, th:first-child {
	padding-left: 0;
}
td:last-child, th:last-child {
	padding-right: 0;
}
table code {
	white-space: nowrap;
}
tbody tr {
	border-top: 1px solid black;
}
</style>
<table>
	<thead><th>Interface Name</th><th>Summary</th></thead>
	<tbody>
		<tr>
			<td>[can-connect/DataInterface Data]</td>
			<td>
				The methods used by behaviors to get or mutate information in some form of persisted storage. These methods only operate on *raw* data comprised of plain JS Objects, Arrays and primitive types.<br/><br/>
			The most common interface methods of the [can-connect/DataInterface DataInterface] are:
			<ul>
				<li>[can-connect/connection.getData <code>getData</code>]</li>
				<li>[can-connect/connection.getListData <code>getListData</code>]</li>
				<li>[can-connect/connection.createData <code>createData</code>]</li>
				<li>[can-connect/connection.updateData <code>updateData</code>]</li>
				<li>[can-connect/connection.destroyData <code>destroyData</code>]</li>
			</ul>
			</td>
		</tr>
		<tr>
			<td>[can-connect/InstanceInterface Instance]</td>
			<td>
				The methods used by behaviors to persist or mutate already persisted *typed* objects.<br/><br/>
			The most common interface methods of the [can-connect/InstanceInterface InstanceInterface] are:
			<ul>
				<li>[can-connect/connection.get <code>get</code>]</li>
				<li>[can-connect/connection.getList <code>getList</code>]</li>
				<li>[can-connect/connection.save <code>save</code>]</li>
				<li>[can-connect/connection.destroy <code>destroy</code>]</li>
			</ul>			
			</td>
		</tr>
		<tr>
		  <td>Transition</td>
		  <td>
		    The methods used to transition between raw data and instances. The interface bridges the gap between the Data & Instance interfaces.<br/><br/>
		    The most common methods of this interface are:
		    <ul>
          <li>hydrateInstance</li>
          <li>hydrateList</li>
          <li>serializeInstance</li>
          <li>serializeList</li>
		    </ul>
		  </td>
		</tr>
	</tbody>
</table>

## Built-In Behavior Index

A listing of the behaviors provided by [can-connect] and a short description of their functionality:  

<table>
	<thead><th>Behavior Name</th><th>Summary</th></thead>
	<tbody>
    <tr>
      <td>
        [can-connect/base/base <code>base</code>]
      </td>
      <td>Provides option accessor and convenience methods required by other behaviors. Included in every connection. Not something that would typically be customized.</td>
    </tr>    
		<tr>
			<td>
				[can-connect/cache-requests/cache-requests <code>cache-requests</code>]
			</td>
			<td>Cache response data and use it for future requests.</td>
		</tr>
		<tr>
			<td>
				[can-local-store <code>can-local-store</code>]
			</td>
			<td>Implement a LocalStorage caching connection.</td>
		</tr>
		<tr>
			<td>
				[can-memory-store <code>can-memory-store</code>]
			</td>
			<td>Implement an in-memory caching connection.</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/constructor-hydrate/constructor-hydrate <code>can/constructor-hydrate</code>]
			</td>
			<td>Always check the instanceStore when creating new instances of the connection `Map` type.</td>
		</tr>						
		<tr>
			<td>
				[can-connect/can/map/map <code>can/map</code>]
			</td>
			<td>Create `Map` or `List` instances from responses. Adds connection-aware convenience methods to configured types.</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/ref/ref <code>can/ref</code>]
			</td>
			<td>Handle references to other instances in the raw data responses.</td>
		</tr>				
    <tr>
      <td>
        [can-connect/constructor/constructor <code>constructor</code>]
      </td>
      <td>Manage persistence of instances of a provided constructor function or list type.</td>
    </tr>
    <tr>
      <td>
        [can-connect/constructor/store/store <code>constructor/store</code>]
      </td>
      <td>Prevent multiple instances of a given id or multiple lists of a given set from being created.</td>
    </tr>
		<tr>
			<td>
				[can-connect/data/callbacks/callbacks <code>data/callbacks</code>]
			</td>
			<td>Add callback hooks that are passed the results of the DataInterface request methods.</td>
		</tr>    
		<tr>
			<td>
				[can-connect/data/callbacks-cache/callbacks-cache <code>data/callbacks-cache</code>]
			</td>
			<td>Listen for `data/callbacks` and update the cache when requests complete.</td>
		</tr>			
		<tr>
			<td>
				[can-connect/data/combine-requests/combine-requests <code>data/combine-requests</code>]
			</td>
			<td>Combine overlapping or redundant requests</td>
		</tr>        
		<tr>
			<td>
				[can-connect/data/parse/parse <code>data/parse</code>]
			</td>
			<td>Convert response data into a format needed for other behaviors.</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/url/url <code>data/url</code>]
			</td>
			<td>Persist data to RESTful HTTP services.</td>
		</tr>		
		<tr>
			<td>
				[can-connect/real-time/real-time <code>real-time</code>]
			</td>
			<td>Lists updated when instances are created or deleted.</td>
		</tr>
	</tbody>
</table>

## Ordering Behaviors

When placing a custom behavior in the prototype chain it's important to know what interface methods you intend to implement and those you intend to extend. You may not be the only implementer of a method and for your implementation to be executed, your behavior will need to be lower in the prototype chain. When extending an interface method you may want your extension to run before all other extensions, after all extensions, or at some point between particular extensions. Behaviors lower in the chain execute before extensions higher in the chain.

The built-in behaviors of `can-connect` have a canonical order to ensure they function. Understanding this order may help you better understand where your custom behavior should be ordered:

<table>
	<thead>
		<tr>
			<th>
				Behavior Name
			</th>
			<th>
				Reason For Position
			</th>
		</tr>
	  <tr>
	    <td></td>
	    <td>
        <blockquote><i><b>Note:</b></i> Behaviors here are listed from highest in the prototype chain to lowest.</blockquote>
	    </td>
	  </tr>
	</thead>
	<tbody>
		<tr>
			<td>
				[can-connect/base/base <code>base</code>]
			</td>
			<td>
				Implements option accessor and convenience methods. Positioned highest in the prototype chain since this is basic "helper" functionality used to implement other behaviors.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/url/url <code>data/url</code>]
			</td>
			<td>
				Implements the raw data manipulation methods of the `Data Interface`. Thus it needs to be placed higher than any behaviors that would consume or extend the data manipulation methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/parse/parse <code>data/parse</code>]
			</td>
			<td>
				Extends the data manipulation methods of `Data Interface` to mutate the response received. Thus it needs to be lower in the proto chain than the implementation of those methods, but higher than any users of those methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/cache-requests/cache-requests <code>cache-requests</code>]
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to modifies call to it, fulfilling the call from the [can-connect/base/base.cacheConnection <code>cacheConnection</code>] if possible. Thus it needs to be lower in the proto chain than the implementation of those methods, but higher than any users of those methods. Positioned lower than `data/parse` so parsed data is cached.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/combine-requests/combine-requests <code>combine-requests</code>]
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to modifies call to it, combining requests if possible. Positioned lower than other extensions of the data fetching methods so their extensions to functionality benefit the combined request.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/worker/worker <code>data/worker</code>]
			</td>
			<td>
			  Implements the data fetching methods of the `Data Interface` to redirect calls to them to a worker thread. This behavior should come lower in the prototype chain than the behaviors extending the data fetching methods. This is so that the calls are redirected to the worker as early as possible, keeping all processing related to the data fetching methods isolated to the worker.
			</td>
		</tr>		
		<tr>
			<td>
				[can-connect/constructor/constructor <code>constructor</code>]
			</td>
			<td>
				Implements instance manipulation methods of the `Instance Interface`. Thus it needs to be placed higher than users of these methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/constructor/store/store <code>constructor/store</code>]
			</td>
			<td>
				Extends the instance management methods of the `Instance Interface` modifying them to prevent recreating instances that are already actively used in the app, and provides references to active instances to other behaviors. Thus it's positioned lower than `constructor` but higher other behaviors which depend on those `Instance Interface` methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/map/map <code>can/map</code>]
			</td>
			<td>
				Extends the instance management methods of the `Instance Interface` to integrate can-connect more tightly with CanJS `Map` & `List` types. Thus it's positioned lower than `constructor`.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/ref/ref <code>can/ref</code>]
			</td>
			<td>
				Exposes connection functionality as an instantiable type that enables modeling of the relationships between persisted instance types. Expects CanJS instances to be created by the connection so this is positioned below `can/map`.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/fall-through-cache/fall-through-cache <code>fall-through-cache</code>]
			</td>
			<td>
				Extends instance hydration and data fetching functionality to immediately return using data from a cache while simultaneously making a request, updating the instance when the request completes. This is positioned lower than `constructor` so that the `Instance Interface` hydration methods can be extended.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/real-time/real-time <code>real-time</code>]
			</td>
			<td>
			  Extends the instance creation methods so new or updated instances are added to existing Lists where appropriate. This is positoned lower in the prototype chain so that other `Instance Interface` extensions can be overridden to modify when certain actions execute.
			  <blockquote>
			    <i><b>Note:</b></i> [can-connect/real-time/real-time <code>real-time</code>] depends on:
			    <ul>
			   		<li>[can-connect/constructor/callbacks-once/callbacks-once <code>constructor/callbacks-once</code>]</li>
			   		<li>
			   			[can-connect/data/callbacks/callbacks <code>data/callbacks</code>]
			   		</li>
					  <li>
			   			[can-connect/constructor/store/store <code>constructor/store</code>]
			   		</li>
			    </ul>
			    These (or equivalent custom behaviors) must be included as part of the connection.
			  </blockquote>
			</td>
		</tr>    
		<tr>
			<td>
				[can-connect/data/callbacks-cache/callbacks-cache <code>data/callbacks-cache</code>]
			</td>
			<td>
			  Implements the `Data Interface` callbacks triggered by the `data/callbacks` behavior to keep a cache updated with changes to data. Typically positioned immediately above `data/callbacks` in the prototype chain so that it's the first behavior to react to changes to data via the callbacks.
			</td>
		</tr>    
		<tr>
			<td>
				[can-connect/data/callbacks/callbacks <code>data/callbacks</code>]
			</td>
			<td>
			  Extends the `Data Interface` data fetching methods to know when modifications to data have taken place, in turn calling the `Data Interface` callbacks, notifying higher behaviors that an execution of a data fetching method has completed. This behavior is positioned very low in the prototype chain since the `Data Interface` callbacks are intended to run after a data fetching method is "complete" and no further behaviors extend them.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/constructor/callbacks-once/callbacks-once <code>constructor/callbacks-once</code>]
			</td>
			<td>
			  Extends the `Instance Interface` callback methods to prevent duplicated calls to them. This behavior is positioned very low in the prototype chain since the prevention of duplicate calls should take place as early as possible.  
			</td>
		</tr>    
	</tbody>
</table>

## Combining Behaviors

The combining of behaviors by chaining functions (as shown in the [Behaviors Overview](#behaviors-overview)) is very straightforward but can be tedious to read when combining many behaviors. [can-connect] offers the [can-connect#connect_behaviors_options_ <code>connect</code>] function to assemble behaviors, but to make it clearer to users how connections are assembled we now suggest that users deviating from the pre-built connections (e.g [can-rest-model ]) assemble their behaviors themselves.

 One way behaviors can be assembled cleanly is by using the [`reduce`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) method of arrays which iterates over the elements of an array, assembling a result:  

> ***Note:*** the `init` function must be called after creating the connection to initialize some behaviors. When using the [can-connect#connect_behaviors_options_ <code>connect</code>] function this is called automatically.

@sourceref ./combine.js
@highlight 16-21, 28-31, only
@codepen


## Practical Custom Behavior Examples
As a demo of the concepts shown above, below are examples of custom behaviors that add functionality via behavior implementation, consumption, and extension.

### Fetch-based data/url
The following is an ***implementer*** behavior that implements the same functionality as the [can-connect/data/url/url <code>data/url</code>] behavior, but using the newer [fetch API](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) rather than the XHR API. This behavior may be useful if you want a feature [fetch](https://developer.mozilla.org/en/docs/Web/API/Fetch_API) offers, like the ability to abort a request.
@sourceref ./practical-implementor.js
@codepen

### WebSocket update channel
The following is a ***consumer*** behavior that uses the API of [can-connect/real-time/real-time <code>real-time</code>] to allow real-time updates of models from a web socket connection. A behavior like this may be useful if your API allows you to subscribe via WebSocket to receive notifications of changes to models.
@sourceref ./practical-consumer.html
@codepen

### Auto-updating Field
The following is a ***extender*** behavior that extends the [can-connect/constructor/constructor.createdInstance <code>createdInstance</code>] callbacks to update instances with a "last viewed" time.
@sourceref ./practical-extender.js
@codepen


## A Review of `instance.save` Execution

To illustrate the interactions between a connection's behaviors we're going to trace the execution of the most typical way of persisting a model. That is calling the [can-connect/can/map/map.prototype.save <code>save</code>] method on an instance of a [can-define/map/map CanJS Map] that's been passed as the [can-connect/can/map/map._Map <code>Map</code>] option to a connection; in this case a connection created by [can-rest-model]. The behaviors in [can-rest-model] are:

1. [can-connect/data/url/url <code>data/url</code>]
2. [can-connect/data/parse/parse <code>data/parse</code>]
3. [can-connect/constructor/constructor <code>constructor</code>]
4. [can-connect/can/map/map <code>can/map</code>]

We'll show how the instance methods of these behaviors interact to produce the final results and maintain the state of the connection:

### Illustration Slides

<iframe src="https://docs.google.com/presentation/d/e/2PACX-1vSZYzx_ml8F94NCWIJlq5zLDIX_td5xaaGPsppSBQ68vUfQAbPjtMbzNyIhUXgBsgcpx96vBco0NMNN/embed?start=false" frameborder="0" width="640" height="399" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>

### Step-by-step Explanation

<style>
div.spaced > ol > li {
  margin-bottom: 16px;
}
</style>
<div class='spaced'>

1. A user calls [can-connect/can/map/map.prototype.save <code>save</code>] on an instance of one of their [can-connect ]'d models:
	```js
	class Todo extends ObservableObject { /* ... */ }
	Todo.connection = restModel({
		ObjectType: Todo,
		...
	});
	const todoInstance = new Todo({ value: 'say hello to world' });
	todoInstance.save().then( /* ... */ )
	```
	@highlight 7

    `todoInstance.save()` returns a promise that resolves when all the connection's promise handlers for the request are completed (in step 9).

2. The [can-connect/can/map/map.prototype.save <code>save</code>] method is not a default part of CanJS observable instances, rather it is added to the Todo prototype by the [can-connect/can/map/map <code>can/map</code>] behavior during the creation of the connection. The implementation of [can-connect/can/map/map.prototype.save <code>save</code>] in [can-connect/can/map/map <code>can/map</code>] calls the [can-connect/connection.save <code>save</code>] method of the connection with the instance:
	```js
	connection.save(instance);
	```  

3. At this point the lowest behavior with an implementation of [can-connect/InstanceInterface <code>InstanceInterface</code>] [can-connect/connection.save <code>save</code>] in the connection prototype chain is called. In this case it's the [can-connect/constructor/constructor <code>constructor</code>] behavior. This implementation checks to see if the instance already has an identity value, which means it existed before this request. If it did already exist, an update request is made to the backend by calling the [can-connect/DataInterface <code>Data Interface</code>] method [can-connect/connection.updateData <code>updateData</code>], otherwise [can-connect/connection.createData <code>createData</code>] which happens in this case. The promise returned from [can-connect/connection.createData <code>createData</code>] has a handler added which will execute in step 7.

4. [can-connect/connection.createData <code>createData</code>] is called on [can-connect/data/parse/parse <code>data/parse</code>]. This behavior is an extension that reformats the response returned by the implementation of [can-connect/connection.createData <code>createData</code>]. It calls [can-connect/connection.createData <code>createData</code>] on the behaviors higher in the chain and attaches a promise handler which will execute in step 6.

5. [can-connect/data/url/url.createData <code>createData</code>] is called on [can-connect/data/url/url <code>data/url</code>]. It makes a request to the server and returns a promise for the response data.

6. Once the server responds, the promise handlers begin running. First to run is the one attached by [can-connect/data/parse/parse <code>data/parse</code>], reformatting the response if appropriate.

7. The next and last [can-connect/data/url/url.createData <code>createData</code>] promise handler to run is the one attached by [can-connect/constructor/constructor <code>constructor</code>]. It calls the appropriate [can-connect/InstanceInterface <code>Instance Interface</code>] callback either [can-connect/constructor/constructor.updatedInstance <code>updatedInstance</code>], or in this case [can-connect/constructor/constructor.createdInstance <code>createdInstance</code>].

8. [can-connect/can/map/map <code>can/map</code>] is the lowest behavior in the prototype chain that has a [can-connect/can/map/map.createdInstance <code>createdInstance</code>] callback, so it's called first. It updates the instance that was passed to `connection.save` with any new data in the response and emits a `created` event on the Map constructor. [can-connect/can/map/map <code>can/map</code>] is an implementer of [can-connect/can/map/map.createdInstance <code>createdInstance</code>] not an extender, so at this point [can-connect/constructor/constructor.createdInstance <code>createdInstance</code>] callbacks are finished running.

9. Now that the [can-connect/constructor/constructor.createdInstance <code>createdInstance</code>] callbacks initiated by [can-connect/constructor/constructor <code>constructor</code>] are finished, we resume the execution of [can-connect/connection.save <code>save</code>] promise handlers. The only remaining handlers are any attached to the promise returned from [can-connect/can/map/map.prototype.save <code>instance.save()</code>]. The connection execution is now complete and that user-facing promise is resolved.

</div>
