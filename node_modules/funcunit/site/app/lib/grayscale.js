// Adapted from http://webdesignerwall.com/tutorials/html5-grayscale-image-hover

var grayscale = function(src) {
	var canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		imgObj = new Image();
	
	imgObj.src = src;
	canvas.width = imgObj.width;
	canvas.height = imgObj.height; 
	
	ctx.drawImage(imgObj, 0, 0); 
	var imgPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

	for(var y = 0; y < imgPixels.height; y++){
		for(var x = 0; x < imgPixels.width; x++){
			var i = (y * 4) * imgPixels.width + x * 4;
			var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
			imgPixels.data[i] = avg; 
			imgPixels.data[i + 1] = avg; 
			imgPixels.data[i + 2] = avg;
		}
	}
	
	ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
	return canvas.toDataURL();
};

window.Grayscale = function(elements, fadeDuration) {
	elements.each(function() {
		var el = $(this);

		// wrap the image in a wrapper and clone it, adding the clone to the wrapper
		el.css({"position":"absolute"})
		  .wrap("<div class='img_wrapper' style='display: inline-block'>")
		  .clone()
		  .addClass('img_grayscale')
		  .css({
		  	'position': "absolute",
		  	'z-index': "998",
		  	'opacity': "0"
		  })
		  .insertBefore(el)
		  .queue(function(){
			el.parent().css({
				'width': this.width,
				'height': this.height
			}).end()
			.dequeue();
		});

		// replace the original with a greyscale version
		this.src = grayscale(this.src);
	});

	elements.parent().mouseover(function() {
		// fade in color image
		$(this).find('img:first').stop().animate({opacity:1}, fadeDuration);
	});
};

$(function() {
	$(document.body).on('mouseout', '.img_grayscale', function(){
		// fade out color image
		$(this).stop().animate({opacity:0}, 300);
	});
});
	    