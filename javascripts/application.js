$.Controller('Menu', {}, {
	init : function(){
		this.find('#menu').append(this.buildMenu());
		this.bind(window, 'scroll', this.proxy('mark'));
		this._scroll = $(window).scrollTop();
		this.mark();
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
							html.push('<li>');
							html.push('<a href="#heading-' + nodes[i].id + '" data-level="'+ nodes[i].level +'">' + text.text() + '</a>');
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
					node        = { node: this.headings[i], children: [], level: level, id: id };
			this.headingOffsets.push($(this.headings[i]).offset().top)
			$(this.headings[i]).attr('id', 'heading-' + id);
			byId[id] = node;
			lastByLevel[level] = node;
			byLevel[level].push(node);
			if(parentLevel > 0){
				lastByLevel[parentLevel].children.push(node)
			}
		}
		return build();
	},
	mark : function(){
		var scroll = $(window).scrollTop(),
				windowHeight = $(window).height();
		for(var i = this.headingOffsets.length - 1; i >= 0; i--){
			var offset = this.headingOffsets[i];
			if(offset - windowHeight / 2 < scroll){
				var active = this.find('#menu a.active'),
						current = this.find('#menu a[href="#heading-' + (i + 1) + '"]');
				if(active.attr('href') != current.attr('href')){
					active.removeClass('active');
					if(active.data('level') == 2){
						active.siblings('ul').hide()
					} else if(active.data('level') === 3){
						active.closest('ul').hide();
					}
					if(current.data('level') == 2){
						current.siblings('ul').show();
					}
					current.addClass('active');
					current.closest('ul').show();
				}
				return;
			}
		}
	}
});

$('#wrapper').menu();