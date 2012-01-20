/*,
		sort: function(method, silent){
			var comparator = this.comparator,
				args = comparator ? [function(a, b){
					a = a[comparator]
					b = b[comparator]
					return a === b ? 0 : (a < b ? -1 : 1);
				}] : [],
				res = [].sort.apply(this, args);
				
			!silent && trigger(this, "reset");

		}*/
		
		
if(this.comparator && /^\d+./.test(attr) ) {
				
				// get the index
				var index = +/^\d+/.exec(attr)[0],
					// and item
					item = this[index],
					// and the new item
					newIndex = this.sortedIndex(item);
				
				if(newIndex !== index){
					// move ...
					splice.call(this, index, 1);
					splice.call(this, newIndex, 0, item);
					
					trigger(this, "move", [item, newIndex, index]);
					ev.stopImmediatePropagation();
					trigger(this,"change", [
						attr.replace(/^\d+/,newIndex),
						how,
						newVal,
						oldVal
					]);
					return;
				}
			}
			
sortedIndex : function(item){
			var itemCompare = item.attr(this.comparator),
				equaled = 0,
				i;
			for(var i =0; i < this.length; i++){
				if(item === this[i]){
					equaled = -1;
					continue;
				}
				if(itemCompare <= this[i].attr(this.comparator) ) {
					return i+equaled;
				}
			}
			return i+equaled;
		},