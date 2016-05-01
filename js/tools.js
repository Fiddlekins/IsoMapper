'use strict';

var tools = {
	container: document.getElementById('tools-container'),
	header: document.getElementById('tools-header'),
	importInput: document.createElement('input'),
	dragging: {
		enabled: false,
		downX: 0,
		downY: 0,
		x: 0,
		y: 0
	},
	updatePosition: function(left, top){
		if (left !== undefined && top !== undefined) {
			settings['ui']['tools']['left'] = left;
			settings['ui']['tools']['top'] = top;
		}
		tools.container.style.left = settings['ui']['tools']['left'];
		tools.container.style.top = settings['ui']['tools']['top'];
	},
	operations: {}
};

tools.importInput.type = 'file';

tools.container.addEventListener('mousedown', function(e){
	e.preventDefault();
	if (e.target.classList.contains('tools-operation')) {
		tools.operations[e.target.dataset['operation']]();
	}
});

tools.header.addEventListener('mousedown', function(e){
	e.preventDefault();
	if (e.buttons & 1) {
		tools.dragging.enabled = true;
		tools.dragging.downX = e.clientX;
		tools.dragging.downY = e.clientY;
		tools.dragging.x = parseInt(tools.container.style.left, 10);
		tools.dragging.y = parseInt(tools.container.style.top, 10);
	}
});

tools.importInput.addEventListener('change', function(e){
	tools.importInputReadJSON(e.target.files[0]);
});

tools.importInputReadJSON = function(file){
	try {
		var reader = new FileReader();
		reader.onload = function(){
			var importedData = JSON.parse(reader.result);
			isoMapper.setCurrentMap(importedData);
		};
		reader.readAsText(file);
	} catch (err) {
		console.error('Error: ' + file.name + ' is not a valid JSON file.');
	}
};

tools.operations['import'] = function(){
	var clickEvent = new MouseEvent('click');
	tools.importInput.dispatchEvent(clickEvent);
};

tools.operations['export'] = function(){
	download('IsoMapper-' + Date.now(), JSON.stringify(isoMapper.currentMap));
};

tools.operations['clear'] = function(){
	isoMapper.setCurrentMap(JSON.parse(JSON.stringify(isoMapper.defaultMap)));
};

tools.operations['resetView'] = function(){
	isoMapper.view.reset();
	isoMapper.isDirty.all = true;
};

var download = function(filename, text){
	var pom = document.createElement('a');
	pom.setAttribute('href', makeTextFile(text));
	pom.setAttribute('download', filename);

	if (document.createEvent) {
		var event = document.createEvent('MouseEvents');
		event.initEvent('click', true, true);
		pom.dispatchEvent(event);
	} else {
		pom.click();
	}
};

var textFile = null;
var makeTextFile = function(text){
	var data = new Blob([text], {type: 'text/plain'});

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	}

	textFile = window.URL.createObjectURL(data);

	return textFile;
};
