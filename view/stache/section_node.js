steal('can/util', function(can){
	
	function SectionNode(){
		this.torndown = false;
		this.childNodes = [];
		this.oldChildNodes = [];
		this._onteardown = null;
	}
	can.extend(SectionNode.prototype,{
		teardown: function(){
			if(!this.torndown) {
				this.torndown = true;
				if( this._onteardown ) {
					console.log("tearing down");
					this._onteardown();
					this._onteardown = null;
				}
				for(var i = 0, len = this.oldChildNodes.length; i < len; i++) {
					this.oldChildNodes[i].teardown();
				}
				for(var i = 0, len = this.childNodes.length; i < len; i++) {
					this.childNodes[i].teardown();
				}
				this.childNodes = [];
			}
		},
		onteardown: function(cb){
			this._onteardown = cb;
		},
		addChild: function(childNode){
			this.childNodes.push(childNode);
		},
		clearAndSave: function(){
			for(var i = 0, len = this.oldChildNodes.length; i < len; i++) {
				this.oldChildNodes[i].teardown();
			}
			this.oldChildNodes = this.childNodes;
			this.childNodes = [];
		}
	});
	
	return SectionNode;
	
});
