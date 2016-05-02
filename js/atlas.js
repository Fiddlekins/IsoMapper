'use strict';

var atlas = {
	imgLib: {},
	manifestLib: {},
	manifest: {},
	canvas: document.createElement('canvas'),
	addToImgLib: function(fileName, data){
		atlas.imgLib[fileName] = document.createElement('img');
		atlas.imgLib[fileName].src = data;
		atlas.imgLib[fileName].onload = atlas.updateManifest; // Make sure image has loaded before updating the palette
	},
	addToManifestLib: function(fileName, data){
		atlas.manifestLib[fileName] = data;
		atlas.updateManifest();
	},
	updateManifest: function(){
		var fileNameRegex = /(.*)\./;
		for (var atlasName in atlas.manifestLib) {
			if (atlas.manifestLib.hasOwnProperty(atlasName) && atlas.imgLib.hasOwnProperty(atlasName)) {
				var img = atlas.imgLib[atlasName];
				var manifest = atlas.manifestLib[atlasName];

				for (var tileIndex = 0; tileIndex < manifest['tiles'].length; tileIndex++) {
					var tile = manifest['tiles'][tileIndex];
					var fileNameMatch = tile['name'].match(fileNameRegex);
					var imgName = fileNameMatch ? fileNameMatch[1] : tile['name'];

					// Do some jiggery pokery to the offsets to ensure it's being drawn on the pixel regardless of whether width and height are even
					// Width gets the 1 minus because of the +0.5 that's given to it elsewhere
					atlas.manifest[imgName] = {
						source: img,
						sourceX: tile['sourceX'],
						sourceY: tile['sourceY'],
						width: tile['trimmedWidth'],
						height: tile['trimmedHeight'],
						offsetX: tile['trimmedX'] - (tile['width'] + (1 - tile['width'] % 2)) / 2,
						offsetY: tile['trimmedY'] - (tile['height'] + tile['height'] % 2) / 2
					};
				}
			}
		}
		palette.updateTiles();
		isoMapper.isDirty.main = true;
	}
};

atlas.ctx = atlas.canvas.getContext('2d');

atlas.processRawImage = function(file){
	var reader = new FileReader();
	reader.onload = function(){
		var dataUrl = reader.result;
		var stagingImage = document.createElement('img');
		stagingImage.src = dataUrl;

		var stagingCanvas = document.createElement('canvas');
		var ctx = stagingCanvas.getContext('2d');

		stagingImage.onload = function(){
			stagingCanvas.width = stagingImage.width;
			stagingCanvas.height = stagingImage.height;
			ctx.drawImage(stagingImage, 0, 0);
			var imgData = ctx.getImageData(0, 0, stagingCanvas.width, stagingCanvas.height);
			var trimmedDimensions = atlas.getTrimmedDimensions(imgData);

			// By resizing the canvas we should also fully clean it
			stagingCanvas.width = trimmedDimensions.width;
			stagingCanvas.height = trimmedDimensions.height;

			ctx.drawImage(
				stagingImage,
				trimmedDimensions.x,
				trimmedDimensions.y,
				trimmedDimensions.width,
				trimmedDimensions.height,
				0,
				0,
				trimmedDimensions.width,
				trimmedDimensions.height
			);

			atlas.addToImgLib(file.name, stagingCanvas.toDataURL());
			atlas.addToManifestLib(file.name, {
				'tiles': [
					{
						'name': file.name,
						'sourceX': 0,
						'sourceY': 0,
						'width': stagingImage.width,
						'height': stagingImage.height,
						'trimmedX': trimmedDimensions.x,
						'trimmedY': trimmedDimensions.y,
						'trimmedWidth': trimmedDimensions.width,
						'trimmedHeight': trimmedDimensions.height
					}
				]
			});
		};
	};
	reader.readAsDataURL(file);
};

atlas.getTrimmedDimensions = function(imgData){
	var output = {
		x: 0,
		y: 0,
		width: imgData.width,
		height: imgData.height
	};

	var x;
	var y;
	var w = imgData.width;
	var h = imgData.height;
	var alpha;

	// Run along the top edge
	for (y = 0; y < h; y++) {
		for (x = 0; x < w; x++) {
			alpha = imgData.data[atlas.getPixelDataIndex(x, y, w, h, 3)];
			if (alpha > 0) {
				output.y = y;
				y = h; // Break outer loop
				break;
			}
		}
	}

	// Run along the bottom edge
	for (y = h - 1; y > 0; y--) {
		for (x = 0; x < w; x++) {
			alpha = imgData.data[atlas.getPixelDataIndex(x, y, w, h, 3)];
			if (alpha > 0) {
				output.height = y - output.y + 1;
				y = 0; // Break outer loop
				break;
			}
		}
	}

	// Run along the left edge
	for (x = 0; x < w; x++) {
		for (y = output.y; y < output.y + output.height; y++) {
			alpha = imgData.data[atlas.getPixelDataIndex(x, y, w, h, 3)];
			if (alpha > 0) {
				output.x = x;
				x = w; // Break outer loop
				break;
			}
		}
	}

	// Run along the right edge
	for (x = w - 1; x > 0; x--) {
		for (y = output.y; y < output.y + output.height; y++) {
			alpha = imgData.data[atlas.getPixelDataIndex(x, y, w, h, 3)];
			if (alpha > 0) {
				output.width = x - output.x + 1;
				x = 0; // Break outer loop
				break;
			}
		}
	}

	return output;
};

atlas.getPixelDataIndex = function(x, y, w, h, typeOffset){
	return (((y * w) + x) * 4) + typeOffset;
};
