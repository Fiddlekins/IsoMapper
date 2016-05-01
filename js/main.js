'use strict';
// Execute all this after the rest is done and ready

tools.updatePosition();
palette.updatePosition();
palette.updateDimensions();

// Add missing tile to manifest
atlas.addToImgLib('missing-tile.png', 'img/missing-tile.png');
atlas.addToManifestLib('missing-tile.png', {
	'tiles': [
		{
			'name': 'missing-tile.png',
			'sourceX': 0,
			'sourceY': 0,
			'width': 69,
			'height': 80,
			'trimmedX': 0,
			'trimmedY': 0,
			'trimmedWidth': 69,
			'trimmedHeight': 80
		}
	]
});

isoMapper.generateGrid();
isoMapper.view.reset();
window.requestAnimationFrame(isoMapper.draw);
