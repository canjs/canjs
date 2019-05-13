@page guides/data-customizing-connections Customizing Connections
@parent guides/data-extreme
@outline 3

@description an introduction to the layers that make up can-connect and how to customize a connection

@body

## Note to reader
 
The **Data guide** and its sub-sections are a work in progress and are currently under review. The information provided is accurate, however, it will likely undergo revisions before being formerly published. Feel free to go through these sections to learn about how connection customization works, and please leave any comments in [this Google Doc](https://docs.google.com/document/d/1Ins62Zr-rIgBHCpfIZ-VHJKrxCjmOz1rZmUSP_a6shA/edit?usp=sharing).

## Introduction
CanJS provides several convenient ways of creating service layer interfaces for your data models (i.e Lists & Maps). These ways include `can-rest-model`, `can-realtime-rest-model` and `can-super-model`. Underneath the surface these are all just pre-defined sets of the built-in behaviors of `can-connect`.

These pre-defined sets of built-in behaviors cover many use cases, but developers may need to customize their service integrations. This could be to add additional features, or integrate with unusual backends not supported by the included behaviors. Customization is accomplished by using connections including new custom behaviours. Custom behaviours can integrate with or replace the built-in behaviors that make up a connection. Consequently, authors of custom behaviors will need to have good knowledge of the functionality provided by existing behaviors and the points of interaction between them.

This guide will cover how behaviors are implemented in a general sense, the importance of behavior ordering and the interfaces that are the points of interaction for behaviors.

## Interfaces Overview
Interfaces in `can-connect` refer to categorizations of related methods that may be implemented by a behavior. These methods define how the layers (behaviors) of `can-connect` interact with each other, and the public API of the connection. Essentially, interfaces are a loose specification of shared "extension points" that are used in the implementation of behaviors. For example, two behaviors that implement the same extension point differently:

@sourceref ./interface.html
@highlight 4,6-18,20-27,only
@codepen  

Considering interfaces are just potential points of extension, an entire interface doesn't need to be implemented for a connection to function. Many behaviors interact to implement parts of an interface. Functions of one interface may depend on functions from another.

As an example of how interfaces are used as extension points: the `Data Interface` defines ~20 methods, but the `data/url` behavior only implements 5 of them. `getListData`  is one of those 5 methods and it's implementation simply makes an HTTP request. Other behaviors in a connection might extend `data/url`'s `getListData`, possibly to add request combining or request caching. A typical connection would likely have at least one behavior that implements `getList` from the `Instance Interface`, whose implementation would call the `getListData` implementation of this connection.

## Behaviors Overview
Behaviors are the "layers" of `can-connect` connections. A connection is an object with a prototype chain made of behavior instances. The default export of behavior modules are "object extension functions" that add an instance of the behavior to the prototype chain of the passed object instance, and by chaining these functions connections are built:

@sourceref ./chain.html
@highlight 9,only
@codepen  

Behaviors can implement interface methods (being a method implementor), use methods provided by other behaviors (being a method consumer) and extend other behavior's implementations of methods (being a method extender).

To be a method implementor a behavior just needs to include that method as part of their definition:

@sourceref ./implement.html
@highlight 5-12,only
@codepen     

Being a method consumer just means calling a method on the connection:

@sourceref ./consume.html
@highlight 15-22,only
@codepen   

Extension is a bit more complicated. Property access on a connection works like any normal JavaScript object, the property is first searched for on the connection object instance, before searching up the objects in the prototype chain. Since behaviors are instances on that chain, a behavior can override an implementation of a property from a behavior higher in the prototype chain. That feature, along with behaviors having a reference to the prototype higher than them in the chain, is what allows them to extend interface methods. This is done by overriding a method and calling the previous implementation as part of that overriding implementation:

@sourceref ./extend.html
@highlight 15-24, only
@codepen
 
 
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
</style>
 
## Interface Index
<table>
	<thead><th>Interface Name</th><th>Summary</th></thead>
	<tbody>
		<tr>
			<td><a href="/doc/can-connect/DataInterface.html">Data</a></td>
			<td>The methods used by behaviors to get or mutate information in some form of persisted storage. These methods only operate on *raw* data comprised of plain JS Objects, Arrays and primitive types.</td>
		</tr>
		<tr>
			<td><a href="/doc/can-connect/InstanceInterface.html">Instance</a></td>
			<td>The methods used by behaviors to persist or mutate already persisted *typed* objects.</td>
		</tr>
	</tbody>
</table>

## Built-In Behavior Index
<table>
	<thead><th>Behavior Name</th><th>Summary</th></thead>
	<tbody>
    <tr>
      <td>
        [can-connect/base/base <code>base</code>]
      </td>
      <td>Provides option accessor and convience methods required by other behaviors. Included in every connection. Not something that would typically be customized.</td>
    </tr>
		<tr>
			<td>
				[can-connect/data/url/url <code>data/url</code>]
			</td>
			<td>Persist data to RESTful HTTP services.</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/parse/parse <code>data/parse</code>]
			</td>
			<td>Convert response data into a format needed for other behaviors.</td>
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
				[can-connect/real-time/real-time <code>real-time</code>]
			</td>
			<td>Lists updated when instances are created or deleted.</td>
		</tr>
		<tr>
			<td>
				[can-connect/cache-requests/cache-requests <code>cache-requests</code>]
			</td>
			<td>Cache response data and use it for future requests.</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/combine-requests/combine-requests <code>data/combine-requests</code>]
			</td>
			<td>Combine overlapping or redundant requests</td>
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
				[can-connect/can/merge/merge <code>can/merge</code>]
			</td>
			<td>Minimize updates to deeply nested instance data when new data is returned from the server.</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/constructor-hydrate/constructor-hydrate <code>can/constructor-hydrate</code>]
			</td>
			<td>Always check the instanceStore when creating new instances of the connection `Map` type.</td>
		</tr>				
	</tbody>
</table>

## Ordering Behaviors

When placing a custom behavior in the prototype chain it's important to know what interface methods you intend to implement and those you intend to extend. You may not be the only implementor of a method and for your implementation to be executed, your behavior will need to be lower in the prototype chain. When extending an interface method you may want your extension to run before all other extensions, after all extensions or at some point between particular extensions. Behaviors lower in the chain execute before extensions higher in the chain. 

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
	      <bNote:</b> Behaviors here are listed from highest in the prototype chain to lowest.
	    </td>
	  </tr>
	</thead>
	<tbody>
    <tr>
      <td>
        [can-connect/base/base <code>base</code>]
      </td>
      <td>Implements option accessor and convience methods. Positioned highest in the prototype chain since this is basic "helper" functionality used to implement other behaviors.</td>
    </tr>
		<tr>
			<td>
				[can-connect/data/url/url <code>data/url</code>]
			</td>
			<td>
				Implements the data fetching methods of the `Data Interface`. Thus it needs to be placed higher any behaviors that would fetch data.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/data/parse/parse <code>data/parse</code>]
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to mutate the response received. Thus it needs to be lower in the proto chain than the implementation of those methods, but higher than any users of those methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/cache-requests/cache-requests <code>cache-requests</code>]
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to modifies call to it, fulfilling the call from the `cacheConnection` if possible. Thus it needs to be lower in the proto chain than the implementation of those methods, but higher than any users of those methods. Positioned lower than `data/parse` so parsed data is cached.
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
				Implements instance management methods of the `Instance Interface`. Thus it needs to be placed higher than users of these methods. Placed lower than implementors of the data fetching methods since `constructor` will use those methods as part of manipulating instances.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/constructor/store/store <code>constructor/store</code>]
			</td>
			<td>
				Extends the instance management methods of the `Instance Interface` modifying them to prevent recreating instances that are already actively being used in the app and provides references to active instances to other behaviors. Thus it's positioned lower than `constructor` but higher other behaviors which depend on those `Instance Interface` methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/map/map <code>can/map</code>]
			</td>
			<td>
				Extends the instance management methods of the `Instance Interface` modifying them to create instances of CanJS `Map` & `List`. Thus it's positioned lower than `constructor`  ... ?
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/can/ref/ref <code>can/ref</code>]
			</td>
			<td>
				Exposes connection functionality as a instantiable type that allows instances to be linked together. Expects CanJS instances to be created by the connection so this is positioned below `can/map`.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/fall-through-cache/fall-through-cache <code>fall-through-cache</code>]
			</td>
			<td>
				Extends instance creation and data fetching functionality to immediately return an instance using data from a cache while simultaneously making a request, updating the instance when the request completes. This is positioned lower than `can/map` so that CanJS types are created by the `Instance Interface` methods.
			</td>
		</tr>
		<tr>
			<td>
				[can-connect/real-time/real-time <code>real-time</code>]
			</td>
			<td>
			  Extends the instance creation methods so new or updated instances are added to existing Lists where appropriate. This is positoned lower in the prototype chain so that other `Instance Interface` extensions can be overridden to modify when certain actions execute.
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
			  Extends the `Data Inteface` data fetching methods to know when modifications to data have taken place, in turn calling the `Data Interface` callbacks, notifying higher behaviors that an execution of a data fetching method has completed. This behavior is postioned very low in the prototype chain since the `Data Inteface` callbacks are intended to run after a data fetching method is "complete" and no further behaviors will extend them.
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

## Practically Combining Behaviors

The combining of behaviors by chaining functions (shown in the `Behaviors Overview`) is very convenient but can be tedious to read when combining many behaviors. `can-connect` offers the `connect` function to assemble behaviors, but to make it clearer to users how connections are assembled we now suggest that users deviating from the pre-built connections (e.g `can-rest-model`) assemble their behaviors themselves:

*Note:* the `init` function must be called after creating the connection to initialize some behaviors. When using the `connect` function this is called automatically. 

@sourceref ./combine.html
@highlight 14-19, 26, only
@codepen

## A Review of `connection.save` Execution

To illustrate the interactions between a connections behaviors we're going to trace the execution of the `Instance Interface`'s `save` method on a `can-realtime-rest-model`. The behaviors in `can-realtime-rest-model` are:

1. `data/url`
2. `data/parse`
3. `constructor`
4. `constructor/store`
5. `can/map`
6. `real-time`
7. `data/callbacks`
8. `constructor/callbacks-once`

We'll show how the instance methods of these behaviors interact to produce the final results and maintain the state of the connection:

<style>
div.spaced > ol > li {
  margin-bottom: 16px;
}
</style>
<div class='spaced'>

1. A user calls `connection.save` with a new instance of the connection's `Map` type: 
	<div><code>connection.save(new Todo({ value: 'say hello to world' }));</code></div>
	
2. The `save` method in `constructor/store` is the first to be called since it's the behavior lowest in the prototype chain with a `save` method. When called it starts a reference count for the instance being saved so that if a request for the instance starts while the save is pending, the request will return the same instance when it completes instead of a new instance of the `Todo` type. After starting the count the implementation of `save` higher in the prototype chain is called. The promise returned from that call has a handler added which will execute later.

3. `constructor` is the next behavior which has it's `save` method called. It checks to see if the instance already has an identifier, which means it existed before this request. If it did already exist an update request is made to the backend by calling the `Data Inteface` method `updateData`, otherwise `createData` is called, like in this case. The promise returned from `createData` has a handler added which will execute later.

4. `createData` is called on `data/callbacks`. This behaviors is an extension that calls `Data Interface` callback methods when requests complete. It calls `createData` on the behaviors higher in the chain and adds a handler on the returned promise.

5. `createData` is called on `data/parse`. This behavior is an extension that reformats the response returned by the implementation of `createData`. It calls `createData` on the behaviors higher in the chain and attaches a promise handler.

6. `createData` is called on `data/url`. It makes a request to the server and returns a promise for the response data.

7. Once the server responds the promise handlers begin running. First to run is the one attached by `data/parse`, reformatting the response if appropriate.

8. Next to run is the promise handle attached by `data/callbacks` it calls the `createdData` callback on the connection.

9. In this case the only behavior to have `createdData` called on it is `real-time`. It checks in the instance passed into `connection.save` to see if it could be included as part of any lists currently held in the instance store.

10. Now that the data callback is complete we return to running the promise handlers from `createData`. The next and last handler is the one attached by `constuctor`. It calls the appropriate `Instance Interface` callback either `updatedInstance`, or in this case `createdInstance`.

11. `createdInstance` is an interface callback method implemented by several behaviors. First behavior to run is `constructor/callbacks-once`. It collects a reference to the input passed in order to prevent repeated calls to `createdInstance`. This is needed since `realt-time` may call `createdInstance` early so the next behaviors run before it does it's list inclusion check.

12. `can/map` is the next behavior whose `createdInstance` callback is called. It updates the instance that was passed to `connection.save` with any new data in the response and emits a `created` event on the Map constructor.

13. `constuctor/store` is the next behavior whose `createdInstance` callback is called. It adds the instance passed to `connection.save` to the instance store.

14. `constructor` is the next and last behavior whose `createdInstance` callback is called. It updates the instance that was passed to `connection.save` with any new data in the response. In this case it's superfluous since we're using `can/map` and it does the same thing in a CanJS specific way, which has the benefit of updating observables. However you may not choose to use `can/map` so `constructor` does these updates in a framework agnostic way.

15. Now that `createdInstance` callbacks are finished, we resume the execution `save` promise handlers. The last one to run in this case is from `constructor/store`, and it decrements the reference counting it started at the beginning of this request.  

16. The connection execution is now complete and the promise returned from `connection.save` in the first step now resolves.
 
</div>

## Practical Custom Behavior Example 
As a small demo of the concepts shown above, below is an example of a simple custom behavior that allows updates to instances to be received as part of a WebSocket connection:

@sourceref ./practical.html
@codepen
