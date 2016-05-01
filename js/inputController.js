'use strict';

// Global event listeners go here

window.addEventListener('mouseup', function(e){
	// Left button
	var leftDown = !!(e.buttons & 1);
	palette.dragging.enabled = palette.dragging.enabled && leftDown;
	palette.resizing.enabled = palette.resizing.enabled && leftDown;
});

window.addEventListener('mousemove', function(e){
	e.preventDefault();
	if (palette.dragging.enabled) {
		palette.container.style.left = (palette.dragging.x + e.clientX - palette.dragging.downX) + 'px';
		palette.container.style.top = (palette.dragging.y + e.clientY - palette.dragging.downY) + 'px';
	}
	if (palette.resizing.enabled) {
		palette.container.style.width = (palette.resizing.width + e.clientX - palette.resizing.downX) + 'px';
		palette.tiles.style.height = (palette.resizing.height + e.clientY - palette.resizing.downY) + 'px';
	}
	if (isoMapper.mouseInteraction.mouseMiddleDown) {
		isoMapper.viewPosition.x = isoMapper.mouseInteraction.viewPosition.x - (e.clientX - isoMapper.mouseInteraction.downPosition.x);
		isoMapper.viewPosition.y = isoMapper.mouseInteraction.viewPosition.y - (e.clientY - isoMapper.mouseInteraction.downPosition.y);
		isoMapper.isDirty.all = true;
	}
});

window.addEventListener('resize', function(e){
	isoMapper.generateGrid();
	isoMapper.isDirty.all = true;
});
