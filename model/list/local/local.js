steal.plugins('jquery/dom/cookie','jquery/model/list').then(function($){

$.Model.List.extend("jQuery.Model.List.Local",
{
	retrieve : function(name){
		// each also needs what they are referencd by ?
		var props = window.localStorage[ name ] || "[]",
			instances = [],
			Class = props.type ? $.Class.getObject(props.type) :  null;
		for(var i =0; i < props.ids.length;i++){
			var identity = props.ids[i],
				instanceData = window.localStorage[ identity ];
			instances.push( new Class(instanceData) )
		}
		this.push.apply(this,instances);
		return this;
	},
	store : function(name){
		//  go through and listen to instance updating
		var ids = [], days = this.days;
		this.each(function(i, inst){
			window.localStorage[inst.identity()] = instance.attrs();
			ids.push(inst.identity());
		});
		window.localStorage[name] = {
			type: this[0] && this[0].Class.fullName,
			ids: ids
		};
		return this;
	}
	
});
	
})

