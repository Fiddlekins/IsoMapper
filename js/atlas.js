'use strict';

var atlas = {
	imgLib: {},
	manifestLib: {},
	manifest: {},
	canvas: document.createElement('canvas'),
	addToPalette: function(){
		emptyNode(palette.tiles);
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
					atlas.canvas.width = atlas.manifest[imgName].width;
					atlas.canvas.height = atlas.manifest[imgName].height;

					// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
					atlas.ctx.drawImage(
						atlas.manifest[imgName].source,
						atlas.manifest[imgName].sourceX,
						atlas.manifest[imgName].sourceY,
						atlas.manifest[imgName].width,
						atlas.manifest[imgName].height,
						0,
						0,
						atlas.manifest[imgName].width,
						atlas.manifest[imgName].height
					);

					var paletteImg = document.createElement('img');
					paletteImg.src = atlas.canvas.toDataURL();
					paletteImg.dataset.name = imgName;
					paletteImg.classList.add('noselect');

					palette.tiles.appendChild(paletteImg);
				}
			}
		}
	}
};

atlas.ctx = atlas.canvas.getContext('2d');

// Remove all of an element's children
var emptyNode = function(node){
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
};
