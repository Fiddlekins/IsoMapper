'use strict';

var tools = {
	container: document.getElementById('tools-container'),
	header: document.getElementById('tools-header'),
	importInput: document.createElement('input'),
	zIndexInput: document.getElementById('tools-operation-z-index'),
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
	operations: {},
	previouslyValidXIndexInput: 0.25
};

tools.importInput.type = 'file';

tools.container.addEventListener('mousedown', function(e){
	if (!e.target.classList.contains('permit-mouse-down-event')) {
		e.preventDefault();
	}
	if (e.target.classList.contains('tools-operation') && e.target.dataset['operation']) {
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

tools.zIndexInput.addEventListener('blur', function(e){
	var numberContent = /[0-9]+(\.[0-9]+)?/.exec(tools.zIndexInput.innerHTML);
	if (numberContent && numberContent[0]) {
		tools.updateZIndex(Math.round(numberContent[0] * 4) / 4);
	} else {
		tools.zIndexInput.innerHTML = tools.previouslyValidXIndexInput;
	}
});

tools.zIndexInput.addEventListener('keydown', function(e){
	if (e.code === 'ArrowUp') {
		tools.updateZIndex(tools.previouslyValidXIndexInput + 0.25);
	} else if (e.code === 'ArrowDown') {
		tools.updateZIndex(tools.previouslyValidXIndexInput - 0.25);
	}
});

tools.updateZIndex = function(value){
	tools.previouslyValidXIndexInput = Math.max(Math.min(value, 25), 0.25);
	tools.zIndexInput.innerHTML = tools.previouslyValidXIndexInput;
	isoMapper.interaction.zIndexStep = 4 * tools.previouslyValidXIndexInput;
	settings['zIndexStep'] = isoMapper.interaction.zIndexStep;
	settingsController.save();
};

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

tools.operations['zIndex'] = function(){
	tools.zIndexInput.focus();
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
