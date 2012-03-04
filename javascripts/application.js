var currentH2slug = "";

$.Controller('Menu', {
	defaults : {
		scroll : window
	}
}, {
	init : function(){
		this.find('#menu').append(this.buildMenu());
		setTimeout(this.proxy(function(){
			this.mark();
			this.bind(window, 'scroll', this.proxy('mark'));
		}), 1)
	},
	buildMenu : function(){
		this.headings = this.find('h1,h2,h3');
		this.headingOffsets = [];
		var byId = {},
				lastByLevel = {1: null, 2: null, 3: null},
				byLevel = {1 : [], 2 : [], 3 : []},
				build = function(id){
					var html = ['<ul>'];
					var nodes;
					if(typeof id == 'undefined'){
						nodes = byLevel[1];
					} else {
						nodes = byId[id].children;
					}
					if(nodes){
						for(var i = 0; i < nodes.length; i++){
							var h = $(nodes[i].node), text = $('<div>' + h.html() + '</div>');
							text.find('code').remove();
							var slug = $.trim(text.text()).toLowerCase().replace(/[^A-Za-z0-9_]/g, '_');
							if(nodes[i].level === 2){
								currentH2slug = slug
							} else if(currentH2slug != "" && nodes[i].level === 3){
								slug = currentH2slug + "-" + slug;
							}
							html.push('<li>');
							html.push('<a href="#' + slug + '" class="heading-'+nodes[i].id+'" data-level="'+ nodes[i].level +'">' + text.text() + '</a>');
							html.push(build(nodes[i].id));
							html.push('</li>')
						}
					}
					html.push('</ul>');
					return html.length > 2 ? html.join("") : "";
				};
		for(var i = 0; i < this.headings.length; i++){
			var level       = parseInt(this.headings[i].nodeName.match(/\d/), 10),
					parentLevel = level - 1,
					id          = function(){ return i+1; }(),
					node        = { node: this.headings[i], children: [], level: level, id: id },
					text = $('<div>' + $(this.headings[i]).html() + '</div>');
			text.find('code').remove();
			this.headingOffsets.push($(this.headings[i]).offset().top)
			var slug = $.trim(text.text()).toLowerCase().replace(/[^A-Za-z0-9_]/g, '_');
			if(level === 2){
				currentH2slug = slug;
			} else if(level === 3){
				slug = currentH2slug + "-" + slug;
			}
			$(this.headings[i]).attr('id', slug);
			byId[id] = node;
			lastByLevel[level] = node;
			byLevel[level].push(node);
			if(parentLevel > 0){
				lastByLevel[parentLevel].children.push(node)
			}
		}
		return build();
	},
	"a click" : function(current, ev){
		this._isClicking = true;
		var active = this.find('#menu a.active');
		this.markActive(active, current);
	},
	mark : function(){
		if(this._isClicking){
			delete this._isClicking;
			return;
		}
		var scroll = $(this.options.scroll).scrollTop(),
				windowHeight = $(window).height();
		for(var i = this.headingOffsets.length - 1; i >= 0; i--){
			var offset = this.headingOffsets[i];
			if(offset - windowHeight / 2 < scroll){
				var active = this.find('#menu a.active'),
						current = this.find('#menu a.heading-' + (i + 1));
				this.markActive(active, current);
				return;
			}
		}
	},
	markActive : function(active, current){
		var currentLevel = current.data('level'),
				activeLevel = active.data('level'),
				method = {2: 'siblings', 3: 'closest'}[currentLevel],
				self = this;
		if(active.attr('href') != current.attr('href')){
			if(active.length == 0){ // this happens on load
				//console.log("HERE:", method, currentLevel)
				if(currentLevel > 1){
					current.addClass('active')[method]('ul').slideDown();
				}
			} else {
				if(currentLevel === 2 && activeLevel === 2){
					var currentUl = current.siblings('ul'),
							activeUl  = active.siblings('ul');
					active.removeClass('active');
					current.addClass('active');
					if(currentUl.find('li').length > 0){
						currentUl.slideDown(this.slideDur(currentUl), function(){
							activeUl.slideUp(self.slideDur(activeUl, true))
						});
					} else {
						activeUl.slideUp(self.slideDur(activeUl, true))
					}
					
				} else if(currentLevel === 3 && activeLevel === 2){
					var isSameGroup = current.closest('ul')[0] === active.siblings('ul')[0];
					active.removeClass('active');
					current.addClass('active');
					if(!isSameGroup){
						var currentUl = current.closest('ul'),
								activeUl = active.siblings('ul');
						currentUl.slideDown(this.slideDur(currentUl), function(){
							activeUl.slideUp(self.slideDur(activeUl, true))
						})
					}
				} else if(currentLevel === 2 && activeLevel === 3){
					var currentUl = current.siblings('ul'),
							activeUl  = active.closest('ul'),
							isSameGroup = currentUl[0] === activeUl[0];
					active.removeClass('active');
					current.addClass('active');
					if(!isSameGroup){
						
						active.removeClass('active');
						current.addClass('active');
						if(currentUl.find('li').length > 0){
							currentUl.slideDown(this.slideDur(currentUl), function(){
								activeUl.slideUp(self.slideDur(activeUl, true))
							})
						} else {
							activeUl.slideUp(this.slideDur(activeUl, true))
						}
						
					}
				} else if(currentLevel === 3 && activeLevel === 3){
					var currentUl = current.closest('ul'),
							activeUl = active.closest('ul'),
							isSameGroup = currentUl[0] === activeUl[0];
					active.removeClass('active');
					current.addClass('active');
					if(!isSameGroup){
						currentUl.slideDown(this.slideDur(currentUl), function(){
							activeUl.slideUp(self.slideDur(activeUl, true))
						})
					}
				}
			}
		}
	},
	slideDur : function(ul, hide){
		var base = hide ? 50 : 30,
				dur = base * ul.find('li').length;
		dur = dur > 200 ? dur : 200
		return dur;
	},
	"{window} hashchange" : function(el, ev){
		var hash = location.hash,
				current = this.find('#menu a[href$='+hash+']'),
				active = this.find('#menu a.active'),
				self = this;
		setTimeout(function(){
			self.markActive(active, current);
		}, 1)
		
	}
});
if($('.lt-ie7, .lt-ie8, .lt-ie9').length == 0){
	$('#wrapper').menu();
} else {
	$('#wrapper').menu('html,body');
}