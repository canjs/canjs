steal.plugins("jquery/model").then(function($){
    
    
$.Model.extend("jQuery.Model.JsonRest",
{
    setup: function() {
        if(!this.shortName) return;
        this.singularName =  jQuery.String.underscore( this.shortName);
        this.pluralName = this.singularName+"s";
        this._super();
    },
    
    findAll: function( params, success, error ) {
        $.ajax({
            url: '/'+this.pluralName+'.json',
            type: 'get',
            dataType: 'json',
            data: params,
            success: this.callback(['wrapMany',success]),
            error: error,
            fixture: true
        })
    },
    update: function( id, attrs, success, error ) {
        var params = {};
        for(var n in attrs)
            params[this.singularName+"["+n+"]"] = attrs[n];
            
        $.ajax({
            url: '/'+this.pluralName+'/'+id+'.json',
            type: 'put',
            dataType: 'text',
            data: params,
            complete: this.callback("updateResponse",success, error),
            fixture: "-restUpdate"
            
        })
    },
    updateResponse: function( success, error, xhr, status ) {
        if (/\w+/.test(xhr.responseText)) {
            return error( eval('('+xhr.responseText+')') );
        }
        success({})
    },
    destroy: function( id, success, error ) {
        $.ajax({
            url: '/'+this.pluralName+'/'+id+'.json',
            type: 'delete',
            dataType: 'text',
            success: success,
            error: error,
            fixture: "-restDestroy"
        })
    },
    create: function( attrs, success, error ) {
        var params = {};
        for(var n in attrs)
            params[this.singularName+"["+n+"]"] = attrs[n];
        $.ajax({
            url: '/'+this.pluralName+'.json',
            type: 'post',
            dataType: 'text',
            complete: this.callback("createResponse",success, error),
            data: params,
            fixture: "-restCreate"
        })
    },
    createResponse: function( success, error, xhr, status ) {
        if(status != "success") error(xhr, status)
        
        if (/\w+/.test(xhr.responseText)) {
            var res = eval('('+xhr.responseText+')');
			if(res[this.singularName]){
				success(res[this.singularName]);
				return;
			}
			return error( res );
        }
        var loc = xhr.responseText;
	  	try{loc = xhr.getResponseHeader("location");}catch(e){};
        if (loc) {
          //todo check this with prototype
		  var mtcs = loc.match(/\/[^\/]*?(\w+)?$/);
		  if(mtcs) return success({id: parseInt(mtcs[1])});
        }
        success({});
    }
},
{})
       
})
