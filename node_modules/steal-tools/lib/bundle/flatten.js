// flattens a bundle graph
var winston = require('winston');
var name = require('./name');
var size = require('../node/size');
var bundle = {
		/**
		 * Flattens the list of shares until each script has a minimal depth
		 * @param {Object} shares
		 * @param {Object} depth
		 */
		flatten: function(shares, depth){
			// make waste object
			// mark the size
			while(bundle.maxDepth(shares) > depth){
				var min = bundle.min(shares, depth);
				if(min) {
					bundle.merge(shares, min);
				}
			}
		},
		/**
		 * Merges 2 shares contents.  Shares are expected to be in the order
		 * getMostShared removes them ... by lowest depenency first.
		 * We should merge into the 'lower' dependency.
		 * 
		 * @param {Object} shares
		 * @param {Object} min
		 *     
		 *     diff : {app1 : waste, app2 : waste, _waste: 0}, 
		 *     lower: i, - the 'lower' share whos contents will be merged into, and contents should run first
		 *     higher: j  - the 'higher' share
		 */
		merge: function(shares, min){
			var lower = shares[min.lower],
				upper = shares[min.higher];

			winston.debug("  flattening "+name.getName(upper)+">"+name.getName(lower));
			
			for(var appName in min.diff.bundleToWaste){
				if( min.diff.bundleToWaste[appName] ){
					winston.debug("  + "+min.diff[appName]+" "+appName);
				}
			}
			
			// remove old one
			shares.splice(min.higher, 1);
			
			// merge in files, lowers should run first
			lower.nodes = lower.nodes.concat(upper.nodes);
			
			// merge in apps
			var apps = this.appsHash(lower);
			upper.bundles.forEach(function(appName){
				if(!apps[appName]){
					lower.bundles.push(appName);
				}
			});
			//lower.waste = min.diff;
		},
		/**
		 * Goes through and figures out which package has the greatest depth
		 */
		maxDepth: function(shares){
			var packageDepths = {},
				max = 0;
			shares.forEach(function(share){
				share.bundles.forEach(function(appName){
					packageDepths[appName] = (!packageDepths[appName] ?
											  1 : packageDepths[appName] +1);
					max = Math.max(packageDepths[appName], max);
				});
			});
			return max;
		},
		/**
		 * Goes through every combination of shares and returns the one with
		 * the smallest difference.
		 * Shares can have a waste property that has how much waste the share 
		 * currently has accumulated.
		 * @param {{}} shares
		 * @return {min}
		 *     {
		 *       waste : 123213, // the amount of waste in the composite share
		 *       lower : share, // the more base share, whos conents should 
		 *			be run first
		 *       higher: share // the less base share, whos contents should
		 *			run later
		 *     }
		 */
		min: function(shares, depth){
			var min = {diff: {
				totalWaste: Infinity,
			}, lower: 0, higher: 0};
			for(var i = 0; i < shares.length; i++){
				var shareA = shares[i];
				if( shareA.bundles.length == 1 ){
					continue;
				}
				for(var j = i+1; j < shares.length; j++){
					var shareB = shares[j],
						diff;

					var isTooSmall = shareB.bundles.length == 1 &&
						depth !== 1;
					
					if(isTooSmall){
						continue;
					}
					
					diff = this.diff(shareA, shareB);
					
					if(diff.totalWaste < min.diff.totalWaste){
						min = {
							diff : diff,
							lower: i,
							higher: j
						};
					}
				}
			}
			return min.totalWaste === Infinity ? null : min;
		},
		/**
		 * returns a hash of the app names for quick checking
		 */
		appsHash : function(shared){
			var apps = {};
			shared.bundles.forEach(function(name){
				apps[name] = true;
			});
			return apps;
		},
		// return a difference between one share and another
		// essentially, which apps will have the waste incured by loading
		// b
		diff: function(sharedA, sharedB){
			// combine nodes
			var nodes = sharedA.nodes.concat(sharedB.nodes),
				// bundle names to their waste
				diff = {bundleToWaste: {}, totalWaste: 0};
			
			
			nodes.forEach(function(file){
				file.bundles.forEach(function(appName){
					diff.bundleToWaste[appName] = 0;
				});
			});
			// For each app, check if the node is in it, if not add to its waste.
			for(var appName in diff.bundleToWaste){
				nodes.forEach(function(node){
					// check file's appName
					if(node.bundles.indexOf(appName) == -1){
						diff.bundleToWaste[appName] += size(node);
					}
				});
				diff.totalWaste += diff.bundleToWaste[appName];
			}
			return diff;
		}
	};

module.exports = function(bundles, depth){
	bundle.flatten(bundles, depth);
};
