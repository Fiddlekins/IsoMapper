'use strict';

// Global event listeners go here

window.addEventListener('mousemove', function(e){
	e.preventDefault();
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
	if (isoMapper.mouseInteraction.mouseMiddleDown) {
		isoMapper.viewPosition.x = isoMapper.mouseInteraction.viewPosition.x - (e.clientX - isoMapper.mouseInteraction.downPosition.x);
		isoMapper.viewPosition.y = isoMapper.mouseInteraction.viewPosition.y - (e.clientY - isoMapper.mouseInteraction.downPosition.y);
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
});

window.addEventListener('resize', function(e){
	isoMapper.generateGrid();
	isoMapper.isDirty.all = true;
});
