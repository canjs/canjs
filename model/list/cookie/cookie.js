steal.plugins('jquery/dom/cookie','jquery/model/list').then(function($){
	
$.Model.List.extend("jQuery.Model.List.Cookie",
{
	days : null,
	retrieve : function(name){
		// each also needs what they are referencd by ?
		var props = $.cookie( name ) || {type : null, ids : []},
			instances = [],
			Class = props.type ? $.Class.getObject(props.type) :  null;
		for(var i =0; i < props.ids.length;i++){
			var identity = props.ids[i],
				instanceData = $.cookie( identity );
			instances.push( new Class(instanceData) )
		}
		this.push.apply(this,instances);
		return this;
	},
	store : function(name){
		//  go through and listen to instance updating
		var ids = [], days = this.days;
		this.each(function(i, inst){
			$.cookie(inst.identity(), $.toJSON(inst.attrs()), { expires: days });
			ids.push(inst.identity());
		});
		
		$.cookie(name, $.toJSON({
			type: this[0] && this[0].Class.fullName,
			ids: ids
		}), { expires: this.days });
		return this;
	}
})
	
})

