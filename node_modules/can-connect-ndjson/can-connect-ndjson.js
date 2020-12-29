/* global ReadableStream */
/* exported connectNdjson */
var connect = require("can-connect");
var sortedSetJSON = require("can-connect/helpers/sorted-set-json");
var ndJSONStream = require("can-ndjson-stream");
var canReflect = require("can-reflect");
var namespace = require('can-namespace');

var connectNdjson = connect.behavior("data-ndjson", function(baseConnection) {
  //Feature detection and fallback if ReadableStream and fetch are not supported
  try {
    new ReadableStream();
		if(typeof window.fetch !== "function") {
			throw new Error("fetch not supported");
		}
  } catch (err) {
    return {};
  }
  return {
    hydrateList: function(listData, set) {
      set = set || this.listSet(listData);
      var id = sortedSetJSON(set);
      var list = baseConnection.hydrateList.call(this, listData, set);//instance of list constructor

      if (this._getHydrateListCallbacks[id]) {
        this._getHydrateListCallbacks[id].shift()(list);
        if (!this._getHydrateListCallbacks[id].length){
          delete this._getHydrateListCallbacks[id];
        }
      }
      return list;
    },
    _getHydrateListCallbacks: {},
    _getHydrateList: function(set, callback) {
      var id = sortedSetJSON(set);
      if (!this._getHydrateListCallbacks[id]) {
        this._getHydrateListCallbacks[id] = [];
      }
      this._getHydrateListCallbacks[id].push(callback);
    },
    getListData: function(set) {
      var fetchPromise = fetch(this.ndjson || this.url);
      this._getHydrateList(set, function(list) {
        function streamerr(e) {
          canReflect.setKeyValue(list,"isStreaming", false);
          canReflect.setKeyValue(list,"streamError", e);
        }

        fetchPromise.then(function(response) {
          canReflect.setKeyValue(list,"isStreaming", true);
          return ndJSONStream(response.body);
        }).then(function(itemStream) {
          var reader = itemStream.getReader();
          reader.read().then(function read(result) {
            if (result.done) {
              canReflect.setKeyValue(list,"isStreaming", false);
              return;
            }
            list.push(result.value);
            reader.read().then(read, streamerr);
          }, streamerr);
        });
      });

      return fetchPromise.then(function() {
        return {
          data: []
        };
      });
    }
  };
});

module.exports = namespace.connectNdjson = connectNdjson;
