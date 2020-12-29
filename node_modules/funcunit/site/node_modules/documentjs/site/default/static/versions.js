steal("can/control", "can/util","jquery",function(Control, can, $){
	var pageConfig = window.docObject || {};
	
	var endsWithSlash = function(path){
		return path[path.length -1] === "/";
	};
	
	var combine = function(first, second){
		var right = first[first.length -1],
			left = second[0];
		if(right != "/" && left != "/") {
			return steal.joinURIs(first,second);
		} else if(right == "/" && left == "/") {
			return left+second.substr(1);
		} else {
			return first+second;
		}
	};
	var dirname = function(path){
		var parts = path.split("/");
		parts.pop();
		return parts.join("/");
	};
	var removeTrailingSlash = function(path){
		if(endsWithSlash(path)) {
			return path.substr(0, path.length -1);
		} else {
			return path;
		}
	};
	return Control.extend({
		setup: function(el, options){
			var container;
			el = $(el);
			if(el.attr("id") === "versions" && el[0].nodeName.toLowerCase() === "select") {
				container = el;
			} else {
				container = $("<select id='versions'/>").hide();
				el.after(container);
			}
			
			return Control.prototype.setup.call(this, container, options);
		},
		init: function(){
			if(pageConfig.project && pageConfig.project.version) {
				var self = this;
				
				$.ajax(pageConfig.docConfigDest || "../../documentjs.json", {
					success: function(docConfig){
						self.docConfig = docConfig;
						var versions = [];
						$.each(docConfig.versions||[], function(name){
							versions.push(name);
						});
						self.addOptions(versions);
					},
					error: function(){
						// self.addOptions(["0.0.0","0.0.1"]);	
					},
					dataType: "json"
				});
			}
			
		},
		addOptions: function(versions){
			this.versions = versions;
			var html = "",
				self = this;
			can.each(versions, function(version){
				html += "<option value='"+version+"'"+
							(version == pageConfig.project.version ? 
								" SELECTED" : "") +
						">"+ self.getVersionSelectText(version)+
						"</option>";
			});
			this.element.html(html).fadeIn();
		},
		getVersionSelectText: function(version){
			return pageConfig.versionsSelectText ? 
				pageConfig.versionsSelectText.replace(/<%=\s*version\s*%>/,""+version) : 
				version;
		},
		getVersionedParentPath: function(version ){
			
			var path = (this.docConfig.versionDest || "./<%= version %>/<%= name %>").replace(/<%=\s*version\s*%>/,""+version)
				.replace(/<%=\s*name\s*%>/,""+pageConfig.project.name);
			return dirname(path);
		},
		getDefaultParentPath: function(){
			var path = (this.docConfig.defaultDest || "./<%= name %>").replace(/<%=\s*name\s*%>/,""+pageConfig.project.name);
			return dirname(path);
		},
		'change': function(el, ev) {
			var newVersion = this.element.val(),
				version = pageConfig.project.version,
				loc = ""+window.location,
				isVersioned = loc.indexOf("/"+version+"/") >= 0,
				versions = this.versions,
				isNewCurrentVersion = false,
				defaultVersion = this.docConfig.defaultVersion,
				defaultDest = this.getDefaultParentPath();
				
			for(var i =0 ; i < versions.length; i++){
			
				if(versions[i] == defaultVersion && versions[i] == newVersion){
					isNewCurrentVersion = true;
				} 
			}
	
			// All of this needs to use defaultDest and dest
	
			// going old to new
			if( isVersioned && isNewCurrentVersion )  {
				var afterVersion = loc.replace(new RegExp(".*"+version),"");
				
				var toDocumentJSON = steal.joinURIs(window.location.pathname, 
					pageConfig.docConfigDest );
					
				var toDefaultDest = steal.joinURIs(toDocumentJSON,defaultDest);
				toDefaultDest = removeTrailingSlash(toDefaultDest);
				window.location = toDefaultDest+afterVersion;
				
			// going new to old
			} else if( !isVersioned ) {
				// need to preserve where we are
				var toDocumentJSON = steal.joinURIs(window.location.pathname, 
					pageConfig.docConfigDest );
				var toDefaultDest = steal.joinURIs(toDocumentJSON,defaultDest);
				toDefaultDest = removeTrailingSlash(toDefaultDest);
				// get what's added after the default dest
				var after = window.location.pathname.replace( toDefaultDest, "");
				// get the versioned part
				var versioned = combine(toDocumentJSON, this.getVersionedParentPath(newVersion));

				window.location = versioned+after;
				
			} else {
				// going old to old
				
				window.location = loc.replace("/"+version+"/","/"+newVersion+"/");
			}
			
		}
	});

});

