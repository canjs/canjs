"use strict";
/**
 * @module can-connect/data/localstorage-cache/localstorage-cache localstorage-cache
 * @parent can-connect.deprecated
 * @group can-connect/data/localstorage-cache/localstorage-cache.identifiers 0 identifiers
 * @group can-connect/data/localstorage-cache/localstorage-cache.data-methods 1 data methods
 *
 * Saves raw data in localStorage.
 *
 * @deprecated {5.0} Use [can-local-store] instead.
 *
 * @signature `localStorage( baseConnection )`
 *
 *   Creates a cache of instances and a cache of sets of instances that is
 *   accessible to read via [can-connect/data/localstorage-cache/localstorage-cache.getSets],
 *   [can-connect/data/localstorage-cache/localstorage-cache.getData], and [can-connect/data/localstorage-cache/localstorage-cache.getListData].
 *   The caches are updated via [can-connect/data/localstorage-cache/localstorage-cache.createData],
 *   [can-connect/data/localstorage-cache/localstorage-cache.updateData], [can-connect/data/localstorage-cache/localstorage-cache.destroyData],
 *   and [can-connect/data/localstorage-cache/localstorage-cache.updateListData].
 *
 *   [can-connect/data/localstorage-cache/localstorage-cache.createData],
 *   [can-connect/data/localstorage-cache/localstorage-cache.updateData],
 *   [can-connect/data/localstorage-cache/localstorage-cache.destroyData] are able to move items in and out
 *   of sets.
 *
 * @body
 *
 * ## Use
 *
 * `data/localstorage-cache` is often used with a caching strategy like [can-connect/fall-through-cache/fall-through-cache] or
 * [can-connect/cache-requests/cache-requests].  Make sure you configure the connection's [can-connect/data/localstorage-cache/localstorage-cache.name].
 *
 * ```
 * var cacheConnection = connect([
 *   require("can-connect/data/localstorage-cache/localstorage-cache")
 * ],{
 *   name: "todos"
 * });
 *
 * var todoConnection = connect([
 *   require("can-connect/data/url/url"),
 *   require("can-connect/fall-through-cache/fall-through-cache")
 * ],
 * {
 *   url: "/services/todos",
 *   cacheConnection: cacheConnection
 * });
 * ```
 *
 */
 
module.exports = require("can-local-store");
