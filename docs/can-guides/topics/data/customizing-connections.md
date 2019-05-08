@page guides/data-customizing-connections Customizing Connections
@parent guides/data-extreme
@outline 3

@description an introduction to the layers that make up can-connect and how to customize a connection

@body

## Note to reader
 
The **Data guide** and its sub-sections are a work in progress and are currently under review. The information provided is accurate, however, it will likely undergo revisions before being formerly published. Feel free to go through these sections to learn about how connection customization works, and please leave any comments in [this Google Doc](https://docs.google.com/document/d/1Ins62Zr-rIgBHCpfIZ-VHJKrxCjmOz1rZmUSP_a6shA/edit?usp=sharing).

## Introduction
CanJS provides several convenient ways of creating service layer interfaces for your data models (i.e Lists & Maps). These ways include `can-rest-model`, `can-realtime-model` and `can-super-model`. Underneath the surface these are all just pre-defined sets of the built-in behaviors of `can-connect`.

These pre-defined sets of built-in behaviors cover many use cases, but developers may need to customize their service integrations. This could be to add additional features, or integrate with unusual backends not supported by the included behaviors. Customization is accomplished by using connections including new custom behaviours. Custom behaviours can integrate with or replace the built-in behaviors that make up a connection. Consequently, authors of custom behaviors will need to have good knowledge of the functionality provided by existing behaviors and the points of interaction between them.

This guide will cover how behaviors are implemented in a general sense, the importance of behavior ordering and the interfaces that are the points of interaction for behaviors.

## Interfaces Overview
Interfaces in `can-connect` refer to categorizations of related methods that may be implemented by a behavior. These methods define how the layers (behaviors) of `can-connect` interact with each other, and the public API of the connection. Essentially, interfaces are a loose specification of shared "extension points" that are used in the implementation of behaviors. 

// e.g - show two hypothetical implementations of the same interface method

Considering interfaces are just potential points of extension, an entire interface doesn't need to be implemented for a connection to function. Many behaviors interact to implement parts of an interface. Function of one interface may depend on functions from another.

As an example of how interfaces are used as extension points: the `Data Interface` defines ~20 methods, but the `data-url` behavior only implements 5 of them. `getListData`  is one of those 5 methods and it's implementation simply makes an HTTP request. Other behaviors in a connection might extend `data-url`'s `getListData`, possibly to add request combining or request caching. A typical connection would likely have at least one behavior that implements `getList` from the `Instance Interface`, whose implementation would call the `getListData` implementation of this connection.

## Behaviors Overview
Behaviors are the "layers" of `can-connect` connections. A connection is an object with a prototype chain made of behavior instances. The default export of behavior modules are "object extension functions" that add an instance of the behavior to the prototype chain of the passed object instance, and by chaining these functions connections are built:

// e.g  

Behaviors can implement interface methods (being a method implementor), use methods provided by other behaviors (being a method consumer) and extend other behavior's implementations of methods (being a method extender).

To be a method implementor a behavior just needs to include that method as part of their definition:

// e.g 

Being a method consumer just means calling a method on the connection:

// e.g

Extension is a bit more complicated. Property access on a connection works like any normal JavaScript object, the property is first searched for on the connection object instance, before searching up the objects in the prototype chain. Since behaviors are instances on that chain, a behavior can override an implementation of a property from a behavior higher in the prototype chain. That feature, along with behaviors having a reference to the prototype higher than them in the chain, is what allows them to extend interface methods. This is done by overriding a method and calling the previous implementation as part of that overriding implementation:

// e.g
 
 
<style>
table {

}
td, th {
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
			<td>Identifiers</td>
			<td></td>
		</tr>
		<tr>
			<td>Data</td>
			<td>The methods used by behaviors to get or mutate information in some form of persisted storage. These methods only operate on *raw* data comprised of plain JS Objects, Arrays and primitive types.</td>
		</tr>
		<tr>
			<td>Instance</td>
			<td>The methods used by behaviors to create or mutate *typed* objects created from persisted data.</td>
		</tr>
	</tbody>
</table>

## Built-In Behavior Index
<table>
	<thead><th>Behavior Name</th><th>Summary</th></thead>
	<tbody>
		<tr>
			<td>
				<a href="/doc/can-connect/data/url/url.html">
					<code>data/url</code>
				</a>
			</td>
			<td>Persist data to RESTful or other types of HTTP services.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/parse/parse.html">
					<code>data/parse</code>
				</a>
			</td>
			<td>Convert response data into a format needed for other behaviors.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/constructor/constructor.html">
					<code>constructor</code>
				</a>
			</td>
			<td>Create instances of a provided constructor function or list type.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/constructor/store/store.html">
					<code>constructor/store</code>
				</a>
			</td>
			<td>Prevent multiple instances of a given id or multiple lists of a given set from being created.</td>
		</tr>		
		<tr>
			<td>
				<a href="/doc/can-connect/real-time/real-time.html">
					<code>real-time</code>
				</a>
			</td>
			<td>Lists updated when instances are created or deleted.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/cache-requests/cache-requests.html">
					<code>cache-requests</code>
				</a>
			</td>
			<td>Cache response data and use it for future requests.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/combine-requests/combine-requests.html">
					<code>data/combine-requests</code>
				</a>
			</td>
			<td>Combine overlapping or redundant requests</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-local-store.html">
					<code>can-local-store</code>
				</a>
			</td>
			<td>Implement a LocalStorage caching connection.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-memory-store.html">
					<code>can-memory-store</code>
				</a>
			</td>
			<td>Implement an in-memory caching connection.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/callbacks/callbacks.html">
					<code>data/callbacks</code>
				</a>
			</td>
			<td>Add callback hooks that are passed the results of the DataInterface request methods.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/callbacks-cache/callbacks-cache.html">
					<code>data/callbacks-cache</code>
				</a>
			</td>
			<td>Listen for `data/callbacks` and update the cache when requests complete.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/can/map/map.html">
					<code>can/map</code>
				</a>
			</td>
			<td>Create `Map` or `List` instances from responses. Adds connection-aware convenience methods to configured types.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/can/ref/ref.html">
					<code>can/ref</code>
				</a>
			</td>
			<td>Handle references to other instances in the raw data responses.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/can/merge/merge.html">
					<code>can/merge</code>
				</a>
			</td>
			<td>Minimize updates to deeply nested instance data when new data is returned from the server.</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/can/constructor-hydrate/constructor-hydrate.html">
					<code>can/constructor-hydrate</code>
				</a>
			</td>
			<td>Always check the instanceStore when creating new instances of the connection `Map` type.</td>
		</tr>				
	</tbody>
</table>

## Ordering Behaviors

When placing a custom behavior in the prototype chain it's important to know what interface methods you intend to implement and those you intend to extend. You may not be the only implementor of a method and for your implementation to be executed, your behavior will need to be lower in the prototype chain. When extending an interface method you may want your extension to run before all other extensions, after all extensions or at some point between particular extensions.

The built-in behaviors of `can-connect` have a canonical order to ensure they function. Understanding this order may help you better understand where your custom behavior should be ordered. The behaviors here are listed from highest in the prototype chain to lowest:

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
	</thead>
	<tbody>
		<tr>
			<td>
				<a href="/doc/can-connect/data/url/url.html">
					<code>data/url</code>
				</a>
			</td>
			<td>
				Implements the data fetching methods of the `Data Interface`. Thus it needs to be placed higher any behaviors that would fetch data.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/parse/parse.html">
					<code>data/parse</code>
				</a>
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to mutate the response received. Thus it needs to be lower in the proto chain than the implementation of those methods, but higher than any users of those methods.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/cache-requests/cache-requests.html">
					<code>cache-requests</code>
				</a>
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to modifies call to it, fulfilling the call from the `cacheConnection` if possible. Thus it needs to be lower in the proto chain than the implementation of those methods, but higher than any users of those methods. Positioned lower than `data/parse` so parsed data is cached.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/combine-requests/combine-requests.html">
					<code>combine-requests</code>
				</a>
			</td>
			<td>
				Extends the data fetching methods of `Data Interface` to modifies call to it, combining requests if possible. Positioned lower than other extensions of the data fetching methods so their extensions to functionality benefit the combined request.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/constructor/constructor.html">
					<code>constructor</code>
				</a>
			</td>
			<td>
				Implements instance management methods of the `Instance Interface`. Thus it needs to be placed higher than users of these methods. Placed lower than implementors of the data fetching methods since `constructor` will use those methods as part of manipulating instances.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/constructor/store.html">
					<code>constructor/store</code>
				</a>
			</td>
			<td>
				Extends the instance management methods of the `Instance Interface` modifying them to prevent recreating instances that are already actively being used in the app. Thus it's positioned lower than `constructor` but higher other behaviors which depend on those `Instance Interface` methods.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/can/map.html">
					<code>can/map</code>
				</a>
			</td>
			<td>
				Extends the instance management methods of the `Instance Interface` modifying them to create instances of CanJS `Map` & `List`. Thus it's positioned lower than `constructor`  ... ?
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/can/ref.html">
					<code>can/ref</code>
				</a>
			</td>
			<td>
				Exposes connection functionality as a instantiable type that allows instances to be linked together. Expects CanJS instances to be created by the connection so this is positioned below `can/map`.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/fall-through-cache/fall-through-cache.html">
					<code>can/ref</code>
				</a>
			</td>
			<td>
				Extends instance creation and data fetching functionality to immediately return an instance using data from a cache while simultaneously making a request, updating the instance when the request completes. This is positioned lower than `can/map` so that CanJS types are created by the `Instance Interface` methods.
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/data/worker.html">
					<code>data/worker</code>
				</a>
			</td>
			<td>
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/real-time/real-time.html">
					<code>real-time</code>
				</a>
			</td>
			<td>
			</td>
		</tr>    
		<tr>
			<td>
				<a href="/doc/can-connect/data/callbacks-cache.html">
					<code>data/callbacks-cache</code>
				</a>
			</td>
			<td>
			</td>
		</tr>    
		<tr>
			<td>
				<a href="/doc/can-connect/data/callbacks.html">
					<code>data/callbacks</code>
				</a>
			</td>
			<td>
			</td>
		</tr>
		<tr>
			<td>
				<a href="/doc/can-connect/constructor/callbacks-once.html">
					<code>constructor/callbacks-once</code>
				</a>
			</td>
			<td>
			</td>
		</tr>    
	</tbody>
</table>

## A Review of `connection.save` Execution

To illustrate the interactions between a connections behaviors we're going to trace the execution of the `Instance Interface`'s `save` method on a `can-realtime-model`. We'll show how the instance methods of different behaviors interact to produce the final results and maintain the state of the connect:

1. A user calls `connection.save` with a new instance of the connection's `Map` type. 
	```
	connection.save(new Todo({ value: '' }));
	``` 
2. 
3.

## Practical Custom Behavior Example 
- emit some special event when data of a particular sort is loaded?

// e.g via codepen?
