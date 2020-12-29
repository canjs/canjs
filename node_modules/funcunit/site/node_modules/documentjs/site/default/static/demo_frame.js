steal("can/control","./demo_frame.mustache!","jquery","can/observe","./prettify.js",function(Control,demoFrameMustache,$){
	
	

return can.Control.extend({
	init: function() {
		
		var docConfig = window.docConfig || {};
		// Render out the demo container.
		this.element.html(demoFrameMustache( {demoSrc: (docConfig.demoSrcRoot || ".." )+'/' + this.element.data('demoSrc')}));

		// Start with the demo tab showing.
		this.showTab('demo');

		// When the iframe loads, grab the HTML and JS and fill in the other tabs.
		var self = this;
		var iFrame = this.element.find("iframe");
		iFrame.load(function() {
			var demoEl = this.contentDocument.getElementById('demo-html'),
				sourceEl = this.contentDocument.getElementById('demo-source')

			var html = demoEl ? demoEl.innerHTML : this.contentWindow.DEMO_HTML;
			
			if(!html) {
				// try to make from body
				var clonedBody = $(this.contentDocument.body).clone();
				clonedBody.find("script").each(function(){
					if(!this.type || this.type.indexOf("javascript") >= 0){
						$(this).remove()
					}
				});
				clonedBody.find("style").remove();
				html = $.trim( clonedBody.html() );
			}

			var source = sourceEl ? sourceEl.innerHTML : this.contentWindow.DEMO_SOURCE;
			if(!source){
				var scripts = $(this.contentDocument.body).find("script:not([src])");
				// get the first one that is JS
				for(var i =0; i < scripts.length; i++){
					if(!scripts[i].type || scripts[i].type.indexOf("javascript") >= 0){
						source =  scripts[i].innerHTML
					}
				}
				
			}
			source = $.trim(source);

			self.element.find('[data-for=html] > pre').html(self.prettify(html));

			var prettySource = self.prettify( source.replace(/\t/g,"  ") );
			if(prettySource.length) {
				self.element.find('[data-for=js] > pre').html(prettySource);
				self.element.find('[data-tab=js]').show();
			}


			//prettyPrint();
	
			var resizeIframe = function(){
				
				// The following was called to make it possible to shrink the size of the demo.  
				// This feature was removed because it broke the tooltip demo on can.view.attr's page
				// iFrame.height(0);
				iFrame.height($(iFrame).contents().height());
				setTimeout( arguments.callee, 1000 )
			};
			
			resizeIframe()
			
			
			
		});
	},
	'.tab click': function(el, ev) {
		this.showTab(el.data('tab'));
	},
	showTab: function(tabName) {
		$('.tab', this.element).removeClass('active');
		$('.tab-content', this.element).hide();
		$('.tab[data-tab=' + tabName + ']', this.element).addClass('active');
		$('[data-for=' + tabName + ']', this.element).show();
	},
	prettify: function(unescaped) {
		return prettyPrintOne(unescaped.replace(/</g, '&lt;'));
	}
});

});