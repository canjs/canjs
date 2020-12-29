"use strict";
/**
 * @module can-connect/data/memory-cache/memory-cache memory-cache
 * @parent can-connect.deprecated
 * @group can-connect/data/memory-cache/memory-cache.data-methods data methods
 *
 * Saves raw data in JavaScript memory that disappears when the page refreshes.
 *
 * @deprecated {5.0} Use [can-memory-store] instead.
 *
 * @signature `memoryCache( baseConnection )`
 *
 *   Creates a cache of instances and a cache of sets of instances that is
 *   accessible to read via [can-connect/data/memory-cache/memory-cache.getSets],
 *   [can-connect/data/memory-cache/memory-cache.getData], and [can-connect/data/memory-cache/memory-cache.getListData].
 *   The caches are updated via [can-connect/data/memory-cache/memory-cache.createData],
 *   [can-connect/data/memory-cache/memory-cache.updateData], [can-connect/data/memory-cache/memory-cache.destroyData],
 *   and [can-connect/data/memory-cache/memory-cache.updateListData].
 *
 *   [can-connect/data/memory-cache/memory-cache.createData],
 *   [can-connect/data/memory-cache/memory-cache.updateData],
 *   [can-connect/data/memory-cache/memory-cache.destroyData] are able to move items in and out
 *   of sets.
 *
 * @body
 *
 * ## Use
 *
 * `data/memory-cache` is often used with a caching strategy like [can-connect/fall-through-cache/fall-through-cache] or
 * [can-connect/cache-requests/cache-requests].
 *
 * ```js
 * var cacheConnection = connect([
 *   require("can-connect/data/memory-cache/memory-cache")
 * ],{});
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
 */
var memoryStore = require("can-memory-store");

module.exports = memoryStore;
