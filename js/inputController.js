'use strict';

// Global event listeners go here

var mousePosition = {
	x: 0,
	y: 0
};

window.addEventListener('mousemove', function(e){
	e.preventDefault();
	mousePosition.x = e.clientX;
	mousePosition.y = e.clientY;
	if (tools.dragging.enabled) {
		tools.updatePosition(
			(tools.dragging.x + e.clientX - tools.dragging.downX) + 'px',
			(tools.dragging.y + e.clientY - tools.dragging.downY) + 'px'
		);
	}
	if (palette.dragging.enabled) {
		palette.updatePosition(
			(palette.dragging.x + e.clientX - palette.dragging.downX) + 'px',
			(palette.dragging.y + e.clientY - palette.dragging.downY) + 'px'
		)
	}
	if (palette.resizing.enabled) {
		palette.updateDimensions(
			(palette.resizing.width + e.clientX - palette.resizing.downX) + 'px',
			(palette.resizing.height + e.clientY - palette.resizing.downY) + 'px'
		);
	}
	if (isoMapper.interaction.mouse.middleDown || isoMapper.interaction.key.spaceBarDown) {
		isoMapper.viewPosition.x = isoMapper.interaction.viewPosition.x - (e.clientX - isoMapper.interaction.downPosition.x);
		isoMapper.viewPosition.y = isoMapper.interaction.viewPosition.y - (e.clientY - isoMapper.interaction.downPosition.y);
		isoMapper.isDirty.all = true;
	}
});

window.addEventListener('mouseup', function(e){
	if (tools.dragging.enabled || palette.dragging.enabled || palette.resizing.enabled) {
		settingsController.save();
	}
	// Left button
	var leftDown = !!(e.buttons & 1);
	tools.dragging.enabled = tools.dragging.enabled && leftDown;
	palette.dragging.enabled = palette.dragging.enabled && leftDown;
	palette.resizing.enabled = palette.resizing.enabled && leftDown;
	// Right button
	var rightDown = !!(e.buttons & 2);
	isoMapper.interaction.mouse.rightDown = isoMapper.interaction.mouse.rightDown && rightDown;
	// Middle button
	var middleDown = !!(e.buttons & 4);
	isoMapper.interaction.mouse.middleDown = isoMapper.interaction.mouse.middleDown && middleDown;
});

window.addEventListener('resize', function(e){
	isoMapper.generateGrid();
	isoMapper.isDirty.all = true;
});

window.addEventListener('keydown', function(e){
	if (inputController.keyFunctionMapping.hasOwnProperty(e.code) && inputController.keyFunctionMapping[e.code].down) {
		inputController.keyFunctionMapping[e.code].down();
	}
});

window.addEventListener('keyup', function(e){
	if (inputController.keyFunctionMapping.hasOwnProperty(e.code) && inputController.keyFunctionMapping[e.code].up) {
		inputController.keyFunctionMapping[e.code].up();
	}
});

var inputController = {};

inputController.keyFunctionMapping = {
	'Space': {
		down: function(){
			if (!isoMapper.interaction.key.spaceBarDown) {
				isoMapper.interaction.key.spaceBarDown = true;
				isoMapper.interaction.viewPosition.x = isoMapper.viewPosition.x;
				isoMapper.interaction.viewPosition.y = isoMapper.viewPosition.y;
				isoMapper.interaction.downPosition.x = mousePosition.x;
				isoMapper.interaction.downPosition.y = mousePosition.y
			}
		},
		up: function(){
			isoMapper.interaction.key.spaceBarDown = false;
		}
	}
};