var currentH2slug = "";
var animationCount = 0;
$.Controller('Menu', {
	defaults : {
		scroll : window
	}
}, {
	init : function(){
		this._menu = this.find('#menu');
		this._menu.append(this.buildMenu());
		this.resizeMenu();
		this._menuShouldScroll = false;
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
		clearTimeout(this._markActiveAnalytics)
		this._markActiveAnalytics = setTimeout(function(){
			var path = current.parents('li').find('>a').slice(0,-1).map(function(){ return $(this).text() });
			path = $.makeArray(path).reverse().join('> ').replace(/\s+$/, "");
			_gaq.push(['_trackEvent', 'sectionRead', path]);
		}, 5000)
		var currentLevel = current.data('level'),
				activeLevel = active.data('level'),
				method = {2: 'siblings', 3: 'closest'}[currentLevel],
				self = this,

				animations = [];



		if(active.attr('href') != current.attr('href')){
			if(active.length == 0){ // this happens on load
				if(currentLevel > 1){
					current.addClass('active')
					animations.push([current[method]('ul'), 'slideDown']);
				}
			} else {
				if(currentLevel === 2 && activeLevel === 2){
					var currentUl = current.siblings('ul'),
							activeUl  = active.siblings('ul');
					active.removeClass('active');
					current.addClass('active');
					if(currentUl.find('li').length > 0){
						animations.push([currentUl, 'slideDown', this.slideDur(currentUl)]);
						animations.push([activeUl, 'slideUp', this.slideDur(activeUl, true)]);
					} else {
						animations.push([activeUl, 'slideUp', this.slideDur(activeUl, true)])
					}
					
				} else if(currentLevel === 3 && activeLevel === 2){
					var isSameGroup = current.closest('ul')[0] === active.siblings('ul')[0];
					active.removeClass('active');
					current.addClass('active');
					if(!isSameGroup){
						var currentUl = current.closest('ul'),
								activeUl = active.siblings('ul');
						animations.push([currentUl, 'slideDown', this.slideDur(currentUl)]);
						animations.push([activeUl, 'slideUp', this.slideDur(activeUl, true)]);
					}
				} else if(currentLevel === 2 && activeLevel === 3){
					var currentUl = current.siblings('ul'),
							activeUl  = active.closest('ul'),
							isSameGroup = currentUl[0] === activeUl[0];
					active.removeClass('active');
					current.addClass('active');
					if(!isSameGroup){
						if(currentUl.find('li').length > 0){
							animations.push([currentUl, 'slideDown', this.slideDur(currentUl)]);
							animations.push([activeUl, 'slideUp', this.slideDur(activeUl, true)]);

						} else {
							animations.push([activeUl, 'slideUp', this.slideDur(activeUl, true)])
						}
					}
				} else if(currentLevel === 3 && activeLevel === 3){
					var currentUl = current.closest('ul'),
							activeUl = active.closest('ul'),
							isSameGroup = currentUl[0] === activeUl[0];
					active.removeClass('active');
					current.addClass('active');
					if(!isSameGroup){
						animations.push([currentUl, 'slideDown', this.slideDur(currentUl)]);
						animations.push([activeUl, 'slideUp', this.slideDur(activeUl, true)]);
					}
				}
			}
		}
		if(animations.length > 0){
			var queue = [];
			animationCount += animations.length;
			for(var i = 0; i < animations.length; i++){
				queue.push((function(definition, j){
					return function(){
						var el = $(definition.shift()),
								effect = definition.shift(),
								cb = queue[j+1];
						if(typeof cb === "undefined"){
							cb = self.proxy('positionActiveMenuItem');
						}
						animationCount--;
						definition.push(cb);
						el[effect].apply(el, definition);
					}
				})(animations[i], i))
			}
			queue[0]();
		} else {
			this.positionActiveMenuItem();
		}
	},
	slideDur : function(ul, hide){
		var base = hide ? 50 : 30,
				dur = base * ul.find('li').length;
		dur = dur > 200 ? dur : 200;
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
	},
	resizeMenu : function(){
		var menuWrapHeight = this.find('#menu-wrapper').height(),
				menuHeight     = this._menu.height(),
				windowHeight   = $(window).height();
		this.find('#inner-menu-wrap').css('maxHeight', (windowHeight - (menuWrapHeight - menuHeight) - 40) + "px");
		if(this.find('#inner-menu-wrap').innerHeight() - menuHeight > 2){ // top and bottom borders
			this._menuShouldScroll = true;
		} else {
			this._menuShouldScroll = false;
			this._menu.css('marginTop', 0);
		}
	},
	"#inner-menu-wrap mousemove" : function(el, ev){
		/*if(!this._menuShouldScroll){
			return;
		}*/
		var mousePos = ev.pageY - el.offset().top,
				height   = el.height();
		if(mousePos < 40){
			this._scrollMenu = 'top';
			this.scrollMenu();
		} else if(mousePos > height - 40){
			this._scrollMenu = 'bottom';
			this.scrollMenu();
		} else {
			delete this._scrollMenu;
		}
	},
	"#inner-menu-wrap mouseleave" : function(el, ev){
		delete this._scrollMenu;
	},
	scrollMenu : function(){
		var menu = this._menu,
				menuHeight = menu.height(),
				marginTop  = parseInt(menu.css('marginTop'), 10);
		if(this._scrollMenu == 'top' && marginTop < 0){
			menu.css('marginTop', (marginTop + 1) + "px")
			setTimeout(this.proxy('scrollMenu'), 1);
		} else if(this._scrollMenu == 'bottom' && menuHeight + marginTop > this.find('#inner-menu-wrap').height()){
			menu.css('marginTop', (marginTop - 1) + "px")
			setTimeout(this.proxy('scrollMenu'), 1);
		}
	},
	positionActiveMenuItem : function(){
		clearTimeout(this._positionTimeout);
		this._positionTimeout = setTimeout(this.proxy(function(){
			if(animationCount === 0){
				var active = this.find('#menu a.active');
				if(active.length === 0){
					return;
				}
				var activePos = active.position().top,
						marginTop = parseInt(this._menu.css('marginTop'), 10),
						wrapHeight = this.find('#inner-menu-wrap').height();

				//console.log('TIEMOUT', marginTop);

				if(marginTop > 0){
					this._menu.css('marginTop', '0px');
					return
				} 

				var	viewPortPos = activePos + marginTop;
				
				if(viewPortPos >= 0 && viewPortPos + 25 <= wrapHeight){
					return;
				} else if(viewPortPos < 0){
					this._menu.css({'marginTop': (marginTop + Math.abs(viewPortPos)) + "px"})
				} else if(viewPortPos + 25 > wrapHeight){
					//console.log('!OUT:', this._menu.css('marginTop'), marginTop, (viewPortPos - wrapHeight))
					marginTop = marginTop - 100
					this._menu.css({'marginTop': marginTop + "px"})
				}

			}
		}), 1);
		
	},
	"{window} resize" : function(){
		this.resizeMenu();
	}
});
if($('.lt-ie7, .lt-ie8, .lt-ie9').length == 0){
	$('#wrapper').menu();
} else {
	$('#wrapper').menu('html,body');
}


// google analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-2302003-11']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();