var canReflect = require("can-reflect");


function getItems(data){
	if(Array.isArray(data)) {
		return data;
	} else {
		return data.data;
	}
}

function indexOf(records, identity, queryLogic ){
	var schema = canReflect.getSchema( queryLogic );
	for(var i = 0 ; i < records.length; i++) {
		if(identity === canReflect.getIdentity(records[i],  schema) ) {
			return i;
		}
	}
	return -1;
}

// update could remove all other records that would be in the set
function makeSimpleStore(baseConnection) {
    baseConnection.constructor = makeSimpleStore;
    var behavior = Object.create(baseConnection);

    // this stores data like:
    // queries: {[queryKey]: {queryKey, query, recordIds}}
    // records
    return canReflect.assignMap(behavior, {
        getRecordFromParams: function(record) {
        	var id = canReflect.getIdentity(record, this.queryLogic.schema);
        	return this.getRecord(id);
        },

        log: function(){
			this._log = true;
		},

        getSets: function(){
			return this.getQueries();
		},
		getQueries: function(){
			return Promise.resolve(this.getQueriesSync());
		},
		getQueriesSync: function(){
			return this.getQueryDataSync().map(function(queryData){
				return queryData.query;
			});
		},

        getListData: function(query){
        	query = query || {};
        	var listData = this.getListDataSync(query);
        	if(listData) {
        		return Promise.resolve(listData);
        	}
        	return Promise.reject({
        		title: "no data",
        		status: "404",
        		detail: "No data available for this query.\nAvailable queries: "+
        			JSON.stringify(this.getQueriesSync())
        	});
        },
		getPaginatedListDataSync: function(superSetQueryData) {
			var records = this.getAllRecords();
			var queryWithoutPagination = this.queryLogic.removePagination(superSetQueryData.query);
			var matchingSuperRecordsNoPagination = this.queryLogic.filterMembersAndGetCount(queryWithoutPagination, {}, records);
			var startIndex = indexOf(matchingSuperRecordsNoPagination.data, superSetQueryData.startIdentity, this.queryLogic);
			var matchingSuperRecords = matchingSuperRecordsNoPagination.data.slice(startIndex, startIndex+ this.queryLogic.count(superSetQueryData.query));
			return {
				count: matchingSuperRecordsNoPagination.data.length,
				data: matchingSuperRecords
			};
		},
        getListDataSync: function(query){
			var queryData = this.getQueryDataSync(),
				superSetQueryData,
				isPaginated = this.queryLogic.isPaginated(query);

			for(var i = 0; i < queryData.length; i++) {
        		var checkSet = queryData[i].query;
        		if( this.queryLogic.isSubset(query, checkSet) ) {
					superSetQueryData = queryData[i];
        		}
        	}
			var records = this.getAllRecords();

			if(isPaginated && this.queryLogic.isPaginated(superSetQueryData.query) ) {
				var result = this.getPaginatedListDataSync(superSetQueryData);
				return this.queryLogic.filterMembersAndGetCount(query, superSetQueryData.query, result.data);
			}

            var matching = this.queryLogic.filterMembersAndGetCount(query, {}, records);
            if(matching && matching.count) {
                return matching;
            }
            // now check if we have a query  for it
        	if(superSetQueryData) {
				return {count: 0, data: []};
			}
        },

        updateListData: function(data, query){
			var queryData = this.getQueryDataSync();
        	query = query || {};
            var clonedData = canReflect.serialize(data);
        	var records = getItems(clonedData);
			// Update or create all records
			this.updateRecordsSync(records);
			var isPaginated = this.queryLogic.isPaginated(query);
			var identity = records.length ? canReflect.getIdentity(records[0],  this.queryLogic.schema) : undefined;
			if(isPaginated) {
				// we are going to merge with some paginated set
				for(var i = 0; i < queryData.length; i++) {
	        		var checkSet = queryData[i].query;
					var union = this.queryLogic.union(checkSet, query);
					if( this.queryLogic.isDefinedAndHasMembers(union)  ) {
						var siblingRecords = this.getPaginatedListDataSync(queryData[i]);
						var res = this.queryLogic.unionMembers(checkSet, query, siblingRecords.data, records );
						identity = canReflect.getIdentity(res[0],  this.queryLogic.schema);
						queryData[i] = {
							query: union,
							startIdentity: identity
						};
						this.updateQueryDataSync(queryData);
						return Promise.resolve();
					}
	        	}

				queryData.push({
					query: query,
					startIdentity: identity
				});
				this.updateQueryDataSync(queryData);
				return Promise.resolve();
			}

            // we need to remove everything that would have matched this query before, but that's not in data
            // but what if it's in another set -> we remove it
            var allRecords = this.getAllRecords();
            var curretMatching = this.queryLogic.filterMembers(query, allRecords);
            if(curretMatching.length) {
                var toBeDeleted = new Map();
                curretMatching.forEach(function(record){
                    toBeDeleted.set( canReflect.getIdentity(record, this.queryLogic.schema), record );
                }, this);

                // remove what's in records
                records.forEach(function(record){
                    toBeDeleted.delete( canReflect.getIdentity(record, this.queryLogic.schema) );
                }, this);

                this.destroyRecords( canReflect.toArray(toBeDeleted) );
            }

            // the queries that are not consumed by query
            var allQueries = this.getQueryDataSync();
            var notSubsets = allQueries.filter(function(existingQueryData){
                    return !this.queryLogic.isSubset(existingQueryData.query, query);
                }, this),
                superSets = notSubsets.filter(function(existingQueryData){
                    return this.queryLogic.isSubset(query, existingQueryData.query);
                }, this);

			// would need to note the first record ... so we can do a query w/o pagination
			//

            // if there are sets that are parents of query
            if(superSets.length) {
                this.updateQueryDataSync(notSubsets);
            } else {
                this.updateQueryDataSync(notSubsets.concat([{
					query: query,
					startIdentity:identity
				}]));
            }

        	// setData.push({query: query, items: data});
        	return Promise.resolve();
        },

        getData: function(params){
        	var id = canReflect.getIdentity(params, canReflect.getSchema( this.queryLogic ) );
        	var res = this.getRecord(id);
        	if(res){
        		return Promise.resolve( res );
        	} else {
        		return Promise.reject({
        			title: "no data",
        			status: "404",
        			detail: "No record with matching identity ("+id+")."
        		});
        	}
        },
        createData: function(record){
			this.updateRecordsSync([record]);

			return Promise.resolve(canReflect.assignMap({}, this.getRecordFromParams(record) ));
		},

		updateData: function(record){

			if(this.errorOnMissingRecord && !this.getRecordFromParams(record)) {
				var id = canReflect.getIdentity(record, this.queryLogic.schema);
				return Promise.reject({
					title: "no data",
					status: "404",
					detail: "No record with matching identity ("+id+")."
				});
			}

			this.updateRecordsSync([record]);

			return Promise.resolve(canReflect.assignMap({},this.getRecordFromParams(record) ));
		},

		destroyData: function(record){
			var id = canReflect.getIdentity(record,  this.queryLogic.schema),
				savedRecord = this.getRecordFromParams(record);

			if(this.errorOnMissingRecord && !savedRecord) {

				return Promise.reject({
					title: "no data",
					status: "404",
					detail: "No record with matching identity ("+id+")."
				});
			}
            this.destroyRecords([record]);
			return Promise.resolve(canReflect.assignMap({},savedRecord || record));
		}
    });
}

module.exports = makeSimpleStore;
