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
