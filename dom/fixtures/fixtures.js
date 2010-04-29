(function($){
	if(jQuery.browser.rhino){
        print("\nWARNING! The Fixture Plugin Is Included!!!!!!\n")
    }
	// 
	//  fixture =
	//    true
	//    "some name"
	//    function(){ ... }
	//  default ... 
	//    true ... all are on
	//    false ... all are off ... just don't include
	//    function ... uses this function to convert true, some name
	//   
	
	var ajax = $.ajax;
/**
 *  @class jQuery
 */
// break
    /**
     * Translates an $.ajax settings into a url.  Replace this function if you want to change how
     * fixtures get looked up.
     * @param {Object} settings
     * @return {String} the url that will be used for the fixture
     */
	$.fixture = function(settings){
		var url = settings.url, match, left, right;
        url = url.replace(/%2F/g,"~").replace(/%20/g,"_");
		
		if ( settings.data && settings.processData && typeof settings.data !== "string" )
			settings.data = jQuery.param(settings.data);
		
        if(settings.data && settings.type.toLowerCase() == "get") 
            url += ($.String.include(url,'?') ? '&' : '?') + settings.data

        match = url.match(/^(?:https?:\/\/[^\/]*)?\/?([^\?]*)\??(.*)?/);
		left = match[1];
		
		right = settings.type ? '.'+settings.type.toLowerCase() : '.post';
		if(match[2]){
			left += '/';
			right = match[2].replace(/\#|&/g,'-').replace(/\//g, '~')+right;
		}
//		return left+encodeURIComponent( right);
        return left + right;

	}
// break
/**
 * Adds the fixture option to settings. If present, loads from fixture location instead
 * of provided url.  This is useful for simulating ajax responses before the server is done.
 * @param {Object} settings
 */
	$.ajax = function(settings){
		var func = $.fixture
		if (!settings.fixture) {
			return ajax.apply($, arguments);
		}
		else if (typeof settings.fixture == "string") {
			if($.fixture[settings.fixture])
				settings.fixture = $.fixture[settings.fixture]
			else{
				var url =  settings.fixture;
				if(/^\/\//.test(url)){
					url = steal.root.join(settings.fixture.substr(2))
				}
				settings.url = url
				settings.data = null;
				settings.type = "GET"
				return ajax(settings);
			}
		}
		if (typeof settings.fixture == "function") {
			
            
                setTimeout(function(){
                    if(settings.success)
                        settings.success.apply(null, settings.fixture(settings, "success")  )
                    if(settings.complete)
                        settings.complete.apply(null, settings.fixture(settings, "complete")  )
                }, 100)
            
                
            
            return;
		} 
		var settings = jQuery.extend(true, settings, jQuery.extend(true, {}, jQuery.ajaxSettings, settings));
		
		settings.url = steal.root.join('test/fixtures/'+func(settings)); // convert settings
		settings.data = null;
		settings.type = 'GET';
		return ajax(settings);		
	}
	
	
	var get = $.get;
	/**
	 * Adds a fixture param.  
	 * @param {Object} url
	 * @param {Object} data
	 * @param {Object} callback
	 * @param {Object} type
	 * @param {Object} fixture
	 */
	$.get = function( url, data, callback, type, fixture ){
		// shift arguments if data argument was ommited
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = null;
		}

		return jQuery.ajax({
			type: "GET",
			url: url,
			data: data,
			success: callback,
			dataType: type,
			fixture : fixture
		});
	}
	var post = $.post;
	/**
	 * Adds a fixture param.
	 * @param {Object} url
	 * @param {Object} data
	 * @param {Object} callback
	 * @param {Object} type
	 * @param {Object} fixture
	 */
	$.post= function( url, data, callback, type, fixture ) {
		if ( jQuery.isFunction( data ) ) {
			callback = data;
			data = {};
		}

		return jQuery.ajax({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type,
			fixture : fixture
		});
	}
    
    
	$.extend($.fixture, {
        "-restUpdate": function(settings,cbType){
            switch(cbType){
                case "success": 
                    return [jQuery.extend({id: parseInt(settings.url)}, settings.data)]
                case "complete":
                    return [{ responseText: ""}, "success"]
            }
        },
        "-restDestroy" : function(){return [true]},
        "-restCreate" : function(settings, cbType){
            switch(cbType){
                case "success": 
                    return [{id: parseInt(Math.random()*1000)}];
                case "complete":
                    return [{
                                responseText: "",
                                getResponseHeader: function(){ return "/blah/"+parseInt(Math.random()*1000) }
                            }, "success"]
            }

            
        },
		//used to make lists
		"-make" : function(type, count, make){
			//make all items now ....
			var items = []
			for(var i = 0 ; i < (count); i++){
				var num = i;
				var item =  make(i, items)
				if(!item.id){
					item.id =  num;
				}
				items.push(item)
			}
			$.fixture["-"+type[0]] = function(settings){
				
				
				var retArr = items.slice(0);
	
				
				$.each((settings.data.order || []).slice(0).reverse(), function(i, name){
					var split = name.split(" ");
					retArr = retArr.sort(function(a, b){
						if(split[1].toUpperCase() != "ASC")
							return a[split[0]] < b[split[0]]
						else
							return a[split[0]] > b[split[0]]
					})
				})
				$.each((settings.data.group || []).slice(0).reverse(), function(i, name){
					var split = name.split(" ");
					retArr = retArr.sort(function(a, b){

						return a[split[0]] > b[split[0]]
					})
				})
				var offset = settings.data.offset || 0;
				var  limit = settings.data.limit || (count - offset)
				
				var i =0;
				for(var param in settings.data){
					if(param.indexOf("Id") != -1){
						while(i < retArr.length){
							if(settings.data[param] != retArr[i][param]){
								retArr.splice(i, 1)
							}else{
								i++;
							}
						}
					}	
				}
				
				
				return [{
					"count": retArr.length,
					"limit": settings.data.limit,
					"offset": settings.data.offset,
					"data" : retArr.slice(offset,offset+ limit)
				}]
			}
			$.fixture["-" + type[1]] = function(settings){
				for(var i = 0 ; i < (count); i++){
					if(settings.data.id == items[i].id){
						return [items[i]]
					}
				}
			}
			$.fixture["~"+type[0]] = items;
		}
    })

    
    
/**
 * @page fixtures Fixtures
 * @tag ajax
 * <h1>Fixtures</h1>
 * Fixtures simulate AJAX responses.  They are a great 
 * technique to use when you want to develop JavaScript 
 * independantly of the backend.  This page provides a brief walkthrough
 * of how to create and use fixtures.
 * <h2>Basic Examples</h2>
@codestart
//Named Fixture
$.ajax({url: "task.json",
  dataType: "json",
  type: "get",
  fixture: "first.json", //finds fixture in test/fixtures/first.json
  success: myCallback});
  
//Calculated Fixture
$.ajax({url: "tasks",
  data : {id: 5}, 
  type: "get",
  fixture: true, //finds fixture in test/tasks/id=5.get
  success: myCallback })
@codeend


 * <h2>Creating Fixtures</h2>
 * <p>Fixtures sit in your <span class='highlight'>test/fixtures</span>
 * folder.  There are 2 types of fixtures:</p>
 * <ul>
 *   <li>Calculated - the name of the fixture is calculated from the url and data passed to 
 *       <code>$.ajax</code>.</li>
 *   <li>Named - you give the name of the fixture.</li>
 * </ul>
 * <h2>Using Fixturesa</h2>
 * To enable fixtures, you have to include the <span class='highlight'>dom/fixtures</span> plugin.  To disable fixtures,
 * simply remove the plugin.
 * To make a request use a fixture, 
 * [jQuery.ajax]
 * [jQuery.get]
 * [jQuery.post]
 */
	
})(jQuery);


