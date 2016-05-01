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
	}
};

palette.container.style.left = '5px';
palette.container.style.top = '5px';
palette.container.style.width = '315px';
palette.tiles.style.height = '515px';

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
			readJSON(file);
		} else {
			readImage(file);
		}
	}
});

var readJSON = function(file){
	try {
		var reader = new FileReader();
		reader.onload = function(){
			var fileName = file.name.match(/(.*)\./)[1];
			atlas.manifestLib[fileName] = JSON.parse(reader.result);
			atlas.addToPalette();
		};
		reader.readAsText(file);
	} catch (err) {
		console.error('Error: ' + file.name + ' is not a valid JSON file.');
	}
};

var readImage = function(file){
	try {
		var reader = new FileReader();
		reader.onload = function(){
			var fileName = file.name.match(/(.*)\./)[1];
			atlas.imgLib[fileName] = document.createElement('img');
			atlas.imgLib[fileName].src = reader.result;
			atlas.addToPalette();
		};
		reader.readAsDataURL(file);
	} catch (err) {
		console.error('Error: ' + file.name + ' is not a valid image.');
	}
};
