'use strict';

var palette = {
	container: document.getElementById('palette-container'),
	header: document.getElementById('palette-header'),
	fileInput: document.getElementById('atlas-load'),
	tiles: document.getElementById('palette-tiles'),
	resizeCorner: document.getElementById('palette-resize-corner'),
	selectedTile: '',
	dragging: {
		enabled: false,
		downX: 0,
		downY: 0,
		x: 0,
		y: 0
	},
	resizing: {
		enabled: false,
		downX: 0,
		downY: 0,
		width: 0,
		height: 0
	},
	updatePosition: function(left, top){
		if (left !== undefined && top !== undefined) {
			settings['ui']['palette']['left'] = left;
			settings['ui']['palette']['top'] = top;
		}
		palette.container.style.left = settings['ui']['palette']['left'];
		palette.container.style.top = settings['ui']['palette']['top'];
	},
	updateDimensions: function(width, height){
		if (width !== undefined && height !== undefined) {
			settings['ui']['palette']['width'] = width;
			settings['ui']['palette']['height'] = height;
		}
		palette.container.style.width = settings['ui']['palette']['width'];
		palette.tiles.style.height = settings['ui']['palette']['height'];
	}
};

palette.container.addEventListener('mousedown', function(e){
	if (e.target.dataset.name) {
		isoMapper.cursorType = e.target.dataset.name;
		var previousSelected = palette.container.querySelector('.palette-tile-selected');
		if (previousSelected) {
			previousSelected.classList.remove('palette-tile-selected');
		}
		e.target.classList.add('palette-tile-selected');
	}
	e.preventDefault();
});

palette.header.addEventListener('mousedown', function(e){
	if (e.buttons & 1) {
		palette.dragging.enabled = true;
		palette.dragging.downX = e.clientX;
		palette.dragging.downY = e.clientY;
		palette.dragging.x = parseInt(palette.container.style.left, 10);
		palette.dragging.y = parseInt(palette.container.style.top, 10);
	}
	e.preventDefault();
});

palette.resizeCorner.addEventListener('mousedown', function(e){
	if (e.buttons & 1) {
		palette.resizing.enabled = true;
		palette.resizing.downX = e.clientX;
		palette.resizing.downY = e.clientY;
		palette.resizing.width = parseInt(palette.container.style.width, 10);
		palette.resizing.height = parseInt(palette.tiles.style.height, 10);
	}
	e.preventDefault();
});

palette.fileInput.addEventListener('change', function(e){
	for (var fileIndex = 0; fileIndex < e.target.files.length; fileIndex++) {
		var file = e.target.files[fileIndex];
		if (/\.json/.test(file.name)) {
			palette.fileInputReadJSON(file);
		} else {
			palette.fileInputReadImage(file);
		}
	}
});

palette.fileInputReadJSON = function(file){
	try {
		var reader = new FileReader();
		reader.onload = function(){
			var fileName = file.name.match(/(.*)\./)[1];
			atlas.addToManifestLib(fileName, JSON.parse(reader.result));
		};
		reader.readAsText(file);
	} catch (err) {
		console.error('Error: ' + file.name + ' is not a valid JSON file.');
	}
};

palette.fileInputReadImage = function(file){
	try {
		var reader = new FileReader();
		reader.onload = function(){
			var fileName = file.name.match(/(.*)\./)[1];
			atlas.addToImgLib(fileName, reader.result);
		};
		reader.readAsDataURL(file);
	} catch (err) {
		console.error('Error: ' + file.name + ' is not a valid image.');
	}
};
