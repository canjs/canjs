/**
 * all Commented out code would still work but is replaced by better versions
 * in this case now.
 * 
 * this version exports the can-* packages from ./
 * 
 */
// __ Observables __

// -> Core
//export { define, DefineMap, DefineList } from "./can-define";
export { default as define } from "./can-define";
export { default as DefineMap } from "./can-define-map";
export { default as DefineList } from "./can-define-list";

export { default as value } from "./can-value";
export { default as Observation } from "./can-observation";
export { default as ObservationRecorder } from "./can-observation-recorder";
export { default as SimpleMap } from "./can-simple-map";

// -> Infrastruture
export { default as bind } from "./can-bind";
//export { mapEventBindings, valueEventBindings } from "./can-event-queue";
export { default as mapEventBindings} from "./can-event-queue-map";
export { default as valueEventBindings} from "./can-event-queue-value";
export { default as SimpleObservable } from "./can-simple-observable";


// __ Views __

// -> Core
export { default as Component } from "./can-component";
export { default as stache } from "./can-stache";
export { default as stacheBindings } from "./can-stache-bindings";
export { default as stacheRouteHelpers } from "./can-stache-route-helpers";

// -> Infrastruture
export { default as viewCallbacks } from "./can-view-callbacks";
export { default as viewLive } from "./can-view-live";
export { default as viewModel } from "./can-view-model";
export { default as nodeList } from "./can-view-nodelist";
export { default as viewParser } from "./can-view-parser";
export { default as Scope } from "./can-view-scope";
export { default as target } from "./can-view-target";


// __ Data Models __

// -> Core
export { default as fixture } from "./can-fixture";
export { default as QueryLogic } from "./can-query-logic";
export { default as realtimeRestModel } from "./can-realtime-rest-model";
export { default as restModel } from "./can-rest-model";

// -> Infrastruture
export { default as connect } from "./can-connect";
export { default as localStore } from "./can-local-store";
export { default as memoryStore } from "./can-memory-store";


// __ Routing __

// -> Core
export { default as route } from "./can-route";
export { default as RouteHash } from "./can-route-hash";
export { default as RoutePushstate } from "./can-route-pushstate";

// -> Infrastruture
export { default as param } from "./can-param";
export { default as deparam } from "./can-deparam";


// __ JS Utilities __

// -> Infrastruture
export { default as assign } from "./can-assign";
export { default as defineLazyValue } from "./can-define-lazy-value";
export { default as diff } from "./can-diff";
export { default as globals } from "./can-globals";
export { default as key } from "./can-key";
export { default as KeyTree } from "./can-key-tree";
export { default as makeMap	} from "./can-make-map";
export { default as parseURI } from "./can-parse-uri";
export { default as queues } from "./can-queues";
export { default as string } from "./can-string";
export { default as stringToAny } from "./can-string-to-any";


// __ DOM Utilities __

// -> Infrastruture
export { default as ajax } from "./can-ajax";
export { default as attributeEncoder } from "./can-attribute-encoder";
export { default as childNodes } from "./can-child-nodes";
export { default as Control } from "./can-control";
export { default as domEvents } from "./can-dom-events";
export { default as domMutate } from "./can-dom-mutate";
export { default as domMutateNode } from "./can-dom-mutate-node";
export { default as domMutateDomEvents } from "./can-dom-mutate-dom-events";
export { default as fragment } from "./can-fragment";


// __ Data Validation

// -> Infrastruture
export { default as makeInterfaceValidator } from "./can-validate-interface";


// __ Typed Data __

// -> Infrastruture
export { default as cid } from "./can-cid";
export { default as Construct } from "./can-construct";
export { default as canDataTypes } from "./can-data-types";
export { default as MaybeBoolean } from "./can-data-types-maybe-boolean";
export { default as MaybeDate } from "./can-data-types-maybe-date";
export { default as MaybeNumber } from "./can-data-types-maybe-number";
export { default as MaybeString } from "./can-data-types-maybe-string";
// ToBe Considered export { * without a default!}
export { default, default as can } from "./can-namespace";
export { default as Reflect } from "./can-reflect";
export { default as reflectDependencies } from "./can-reflect-dependencies";
export { default as reflectPromise } from "./can-reflect-promise";

// __ Enable Devtools __
//!steal-remove-start
//import "../enable-can-debug";
//!steal-remove-end
