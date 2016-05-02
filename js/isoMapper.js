'use strict';

var isoMapper = {};

var COS30DEG = Math.cos(2 * Math.PI / 12);

isoMapper.canvasGrid = document.getElementById('canvas-grid');
isoMapper.canvasMain = document.getElementById('canvas-main');
isoMapper.canvasCursor = document.getElementById('canvas-cursor');

isoMapper.setDimensions = function(){
	var width = parseInt(window.getComputedStyle(isoMapper.canvasMain).width);
	var height = parseInt(window.getComputedStyle(isoMapper.canvasMain).height);
	isoMapper.canvasGrid.width = width;
	isoMapper.canvasGrid.height = height;
	isoMapper.canvasMain.width = width;
	isoMapper.canvasMain.height = height;
	isoMapper.canvasCursor.width = width;
	isoMapper.canvasCursor.height = height;
};

isoMapper.ctxGrid = isoMapper.canvasGrid.getContext('2d');
isoMapper.ctxMain = isoMapper.canvasMain.getContext('2d');
isoMapper.ctxCursor = isoMapper.canvasCursor.getContext('2d');

isoMapper.tileLength = 34 / COS30DEG;
isoMapper.verticalLineHorizontalSpacing = COS30DEG * isoMapper.tileLength;
isoMapper.zSteps = 4;

isoMapper.viewPosition = {
	x: 0,
	y: 0
};

isoMapper.cursorType = '';
isoMapper.cursorCoordinate = {
	x: 0,
	y: 0,
	z: 0
};

isoMapper.view = {};
isoMapper.view.reset = function(){
	isoMapper.viewPosition.x = isoMapper.verticalLineHorizontalSpacing - isoMapper.canvasMain.width / 2;
	isoMapper.viewPosition.y = isoMapper.tileLength / 2 - isoMapper.canvasMain.height / 2;
};

isoMapper.defaultMap = {
	'startIndexX': 0,
	'endIndexX': 0,
	'startIndexY': 0,
	'endIndexY': 0,
	'map': {
		0: {
			0: {
				'startIndexZ': 0,
				'endIndexZ': 0,
				0: {
					'type': ''
				}
			}
		}
	}
};

isoMapper.currentMap = {
	'startIndexX': 0,
	'endIndexX': 0,
	'startIndexY': 0,
	'endIndexY': 0,
	'map': {
		0: {
			0: {
				'startIndexZ': 0,
				'endIndexZ': 0,
				0: {
					'type': ''
				}
			}
		}
	},
	draw: function(ctx){
		var dX = isoMapper.currentMap['endIndexX'] - isoMapper.currentMap['startIndexX'] + 1;
		var dY = isoMapper.currentMap['endIndexY'] - isoMapper.currentMap['startIndexY'] + 1;

		for (var x = 0; x < dX + dY - 1; x++) {
			for (var y = Math.min(dY - 1, x), len = Math.max(0, x - dX + 1); y >= len; y--) {
				var cx = isoMapper.currentMap['startIndexX'] + x - y;
				var cy = isoMapper.currentMap['startIndexY'] + y;
				var pillar = isoMapper.currentMap['map'][cx] && isoMapper.currentMap['map'][cx][cy];
				if (pillar) {
					for (var cz = pillar['startIndexZ']; cz <= pillar['endIndexZ']; cz++) {
						var tile = pillar[cz];
						if (tile) {
							if (tile['type'] === '') {
								isoMapper.drawVectorTile(ctx, cx, cy, cz, isoMapper.solidTileColour);
							} else {
								isoMapper.drawGraphicTile(ctx, cx, cy, cz, tile['type']);
							}
							// isoMapper.drawVectorTile(ctx, cx, cy, cz, {
							// 	top:   'rgba(0,0,0,'+(0.2-cz*0.05)+')',
							// 	left:  'rgba(0,0,0,'+(0.2-cz*0.05)+')',
							// 	right: 'rgba(0,0,0,'+(0.2-cz*0.05)+')'
							// });
						}
					}
				}
			}
			// ctx.fillStyle = 'rgba(0,0,0,0.02)';
			// ctx.fillRect(0, 0, isoMapper.canvasMain.width, isoMapper.canvasMain.height);
		}
	},
	addTile: function(x, y, z){
		isoMapper.currentMap['map'][x] = isoMapper.currentMap['map'][x] || {};
		isoMapper.currentMap['map'][x][y] = isoMapper.currentMap['map'][x][y] || {'startIndexZ': z, 'endIndexZ': z};
		isoMapper.currentMap['map'][x][y][z] = isoMapper.currentMap['map'][x][y][z] || {'type': isoMapper.cursorType};
		if (x < isoMapper.currentMap['startIndexX']) {
			isoMapper.currentMap['startIndexX'] = x;
		} else if (x > isoMapper.currentMap['endIndexX']) {
			isoMapper.currentMap['endIndexX'] = x;
		}
		if (y < isoMapper.currentMap['startIndexY']) {
			isoMapper.currentMap['startIndexY'] = y;
		} else if (y > isoMapper.currentMap['endIndexY']) {
			isoMapper.currentMap['endIndexY'] = y;
		}
		if (z < isoMapper.currentMap['map'][x][y]['startIndexZ']) {
			isoMapper.currentMap['map'][x][y]['startIndexZ'] = z;
		} else if (z > isoMapper.currentMap['map'][x][y]['endIndexZ']) {
			isoMapper.currentMap['map'][x][y]['endIndexZ'] = z;
		}
		isoMapper.isDirty.main = true;
	},
	removeTile: function(x, y, z){
		if (isoMapper.currentMap['map'][x]) {
			if (isoMapper.currentMap['map'][x][y]) {
				if (isoMapper.currentMap['map'][x][y][z]) {
					isoMapper.currentMap['map'][x][y][z] = null;
				}
			}
		}
		isoMapper.isDirty.main = true;
	}
};

isoMapper.setCurrentMap = function(mapData){
	isoMapper.currentMap['startIndexX'] = mapData['startIndexX'];
	isoMapper.currentMap['endIndexX'] = mapData['endIndexX'];
	isoMapper.currentMap['startIndexY'] = mapData['startIndexY'];
	isoMapper.currentMap['endIndexY'] = mapData['endIndexY'];
	isoMapper.currentMap['map'] = mapData['map'];
	isoMapper.isDirty.all = true;
};

isoMapper.interaction = {
	mouse: {
		leftDown: false,
		leftShift: false,
		middleDown: false,
		rightDown: false,
		scrollDeltaY: 0
	},
	key: {
		spaceBarDown: false
	},
	viewPosition: {x: 0, y: 0},
	downPosition: {x: 0, y: 0},
	zIndexStep: settings['zIndexStep'],
	checkAddRemoveTile: function(){
		if (isoMapper.interaction.mouse.leftDown) {
			if (isoMapper.interaction.mouse.leftShift) {
				isoMapper.currentMap.removeTile(isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y, isoMapper.cursorCoordinate.z);
			} else {
				isoMapper.currentMap.addTile(isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y, isoMapper.cursorCoordinate.z);
			}
		}
	}
};

isoMapper.canvasMain.addEventListener('mousedown', function(e){
	// Left button
	if (e.buttons & 1) {
		isoMapper.interaction.mouse.leftDown = true;
		if (e.shiftKey) {
			isoMapper.interaction.mouse.leftShift = true;
			isoMapper.currentMap.removeTile(isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y, isoMapper.cursorCoordinate.z);
		} else {
			isoMapper.interaction.mouse.leftShift = false;
			isoMapper.currentMap.addTile(isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y, isoMapper.cursorCoordinate.z);
		}
	} else {
		isoMapper.interaction.mouse.lefteftDown = false;
	}
	// Right button
	if (e.buttons & 2) {
		isoMapper.interaction.mouse.rightDown = true;
	} else {
		isoMapper.interaction.mouse.rightDown = false;
	}
	// Middle button
	if (e.buttons & 4) {
		isoMapper.interaction.mouse.middleDown = true;
		isoMapper.interaction.viewPosition.x = isoMapper.viewPosition.x;
		isoMapper.interaction.viewPosition.y = isoMapper.viewPosition.y;
		isoMapper.interaction.downPosition.x = e.clientX;
		isoMapper.interaction.downPosition.y = e.clientY;
	} else {
		isoMapper.interaction.mouse.middleDown = false;
	}
});

isoMapper.canvasMain.addEventListener('mouseup', function(e){
	// Left button
	isoMapper.interaction.mouse.leftDown = !!(e.buttons & 1);
	// Right button
	isoMapper.interaction.mouse.rightDown = !!(e.buttons & 2);
	// Middle button
	isoMapper.interaction.mouse.middleDown = !!(e.buttons & 4);
});

isoMapper.canvasMain.addEventListener('mouseleave', function(e){
	isoMapper.interaction.mouse.leftDown = false;
});

isoMapper.canvasMain.addEventListener('mouseenter', function(e){
	if (!palette.dragging.enabled && !palette.resizing.enabled) {
		isoMapper.interaction.mouse.leftDown = !!(e.buttons & 1);
	}
});

isoMapper.canvasMain.addEventListener('mousemove', function(e){
	if (!tools.dragging.enabled && !palette.dragging.enabled && !palette.resizing.enabled) {
		var newCursorX = Math.floor(isoMapper.positionToCoordinateX(e.clientX + isoMapper.viewPosition.x, e.clientY + isoMapper.viewPosition.y));
		// Add one to adjust cursor position relative to mouse position
		var newCursorY = Math.floor(isoMapper.positionToCoordinateY(e.clientX + isoMapper.viewPosition.x, e.clientY + isoMapper.viewPosition.y)) + 1;
		if (newCursorX !== isoMapper.cursorCoordinate.x || newCursorY !== isoMapper.cursorCoordinate.y) {
			isoMapper.cursorCoordinate.x = newCursorX;
			isoMapper.cursorCoordinate.y = newCursorY;
			isoMapper.isDirty.cursor = true;
			isoMapper.interaction.checkAddRemoveTile();
		}
	}
});

isoMapper.canvasMain.addEventListener('wheel', function(e){
	if ((e.shiftKey ? e.deltaX : e.deltaY) < 0) {
		isoMapper.interaction.mouse.scrollDeltaY += 1;
	} else {
		isoMapper.interaction.mouse.scrollDeltaY -= 1;
	}
	var previousCursorZ = isoMapper.cursorCoordinate.z;
	isoMapper.cursorCoordinate.z = isoMapper.interaction.mouse.scrollDeltaY * isoMapper.interaction.zIndexStep;
	isoMapper.isDirty.cursor = true;
	if (isoMapper.cursorCoordinate.z !== previousCursorZ) {
		isoMapper.interaction.checkAddRemoveTile();
	}
});

isoMapper.coordinateToPositionX = function(coordinateX, coordinateY){
	return (coordinateX - coordinateY) * isoMapper.verticalLineHorizontalSpacing;
};
isoMapper.coordinateToPositionY = function(coordinateX, coordinateY){
	return (coordinateX + coordinateY) * isoMapper.tileLength / 2;
};
/*
 px = Vcx - Vcy
 py = Lcx + Lcy

 px/V = cx - cy
 py/L = cx + cy

 cx = (px/V + py/L)/2

 cy = (px/L - py/V)/2
 */
isoMapper.positionToCoordinateX = function(positionX, positionY){
	var pxOverV = positionX / isoMapper.verticalLineHorizontalSpacing;
	var pyOverL = positionY / (isoMapper.tileLength / 2);
	return 0.5 * (pxOverV + pyOverL);
};
isoMapper.positionToCoordinateY = function(positionX, positionY){
	var pxOverV = positionX / isoMapper.verticalLineHorizontalSpacing;
	var pyOverL = positionY / (isoMapper.tileLength / 2);
	return 0.5 * (pyOverL - pxOverV  );
};

isoMapper.grid = document.createElement('img');
isoMapper.generateGrid = function(){
	isoMapper.setDimensions();

	var gridCanvas = document.createElement('canvas');
	var gridCtx = gridCanvas.getContext('2d');
	gridCtx.beginPath();

	/* The spacing between each vertical line.
	 * Tiles are two spacings wide
	 */
	var verticalLineHorizontalSpacing = isoMapper.verticalLineHorizontalSpacing;

	/* Need a whole tile on either side of the viewport
	 * Thus ceil to find how many we need to cover the view
	 * And add one to each side
	 * Multiply by two since it's two lines to a tile
	 */
	var verticalLineCount = 2 * ( Math.ceil(isoMapper.canvasMain.width / (2 * verticalLineHorizontalSpacing)) + 2);

	/* This is essentially the number of tiles needed vertically
	 * Again, add one on either side
	 */
	var verticalIntersectionCount = Math.ceil(isoMapper.canvasMain.height / isoMapper.tileLength) + 2;

	// Set the canvas size to match
	gridCanvas.width = verticalLineHorizontalSpacing * verticalLineCount;
	gridCanvas.height = verticalIntersectionCount * isoMapper.tileLength;

	// Draw all the lines
	gridCtx.lineWidth = 0.1;
	for (var verticalLineIndex = 0; verticalLineIndex <= verticalLineCount; verticalLineIndex++) {
		// Draw vertical lines
		gridCtx.moveTo(0.5 + verticalLineIndex * verticalLineHorizontalSpacing, 0);
		gridCtx.lineTo(0.5 + verticalLineIndex * verticalLineHorizontalSpacing, gridCanvas.height);
		// Every other vertical line draw the diagonals
		if (verticalLineIndex % 2 < 1) {
			gridCtx.moveTo(0.5 + verticalLineIndex * verticalLineHorizontalSpacing, 0);
			gridCtx.lineTo(0.5 + (verticalLineIndex + 2 * verticalIntersectionCount) * verticalLineHorizontalSpacing, gridCanvas.height);
			gridCtx.moveTo(0.5 + verticalLineIndex * verticalLineHorizontalSpacing, 0);
			gridCtx.lineTo(0.5 + (verticalLineIndex - 2 * verticalIntersectionCount) * verticalLineHorizontalSpacing, gridCanvas.height);
		}
	}
	for (var additionalDiagonalLineIndex = 1; additionalDiagonalLineIndex < verticalIntersectionCount; additionalDiagonalLineIndex++) {
		// Top left to bottom right diagonals
		gridCtx.moveTo(0.5, additionalDiagonalLineIndex * isoMapper.tileLength);
		gridCtx.lineTo(0.5 + (2 * verticalLineHorizontalSpacing * (verticalIntersectionCount - additionalDiagonalLineIndex)), gridCanvas.height);
		// Top right to bottom left diagonals
		gridCtx.moveTo(0.5 + gridCanvas.width, additionalDiagonalLineIndex * isoMapper.tileLength);
		gridCtx.lineTo(0.5 + gridCanvas.width - 2 * verticalLineHorizontalSpacing * (verticalIntersectionCount - additionalDiagonalLineIndex), gridCanvas.height);
	}
	gridCtx.stroke();

	// Save canvas output off as image
	isoMapper.grid.src = gridCanvas.toDataURL();
};

isoMapper.clearAll = function(ctx){
	ctx.clearRect(0, 0, isoMapper.canvasMain.width, isoMapper.canvasMain.height);
};

isoMapper.isDirty = {
	all: false,
	grid: true,
	main: true,
	cursor: false
};

isoMapper.draw = function(){
	if (isoMapper.isDirty.all || isoMapper.isDirty.grid) {
		isoMapper.clearAll(isoMapper.ctxGrid);

		// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
		isoMapper.ctxGrid.drawImage(
			isoMapper.grid,
			(2 * isoMapper.verticalLineHorizontalSpacing) + isoMapper.viewPosition.x % (2 * isoMapper.verticalLineHorizontalSpacing),
			isoMapper.tileLength + isoMapper.viewPosition.y % isoMapper.tileLength,
			isoMapper.canvasGrid.width,
			isoMapper.canvasGrid.height,
			0,
			0,
			isoMapper.canvasGrid.width,
			isoMapper.canvasGrid.height
		);
	}
	if (isoMapper.isDirty.all || isoMapper.isDirty.main) {
		isoMapper.clearAll(isoMapper.ctxMain);
		isoMapper.currentMap.draw(isoMapper.ctxMain);
	}
	if (isoMapper.isDirty.all || isoMapper.isDirty.cursor) {
		isoMapper.clearAll(isoMapper.ctxCursor);
		isoMapper.drawHighlightedTile(isoMapper.ctxCursor);
	}

	isoMapper.isDirty.all = false;
	isoMapper.isDirty.grid = false;
	isoMapper.isDirty.main = false;
	isoMapper.isDirty.cursor = false;

	window.requestAnimationFrame(isoMapper.draw);
};

isoMapper.highlightTileColour = {
	top: 'rgba(161,231,255,0.3)',
	left: 'rgba(19,162,209,0.3)',
	right: 'rgba(77,210,255,0.3)',
	anchor: 'rgba(161,231,255,0.6)'
};

isoMapper.solidTileColour = {
	top: 'rgba(191,191,191,1)',
	left: 'rgba(119,119,119,1)',
	right: 'rgba(152,152,152,1)'
};

isoMapper.drawHighlightedTile = function(ctx){
	isoMapper.drawVectorTile(ctx, isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y, isoMapper.cursorCoordinate.z, isoMapper.highlightTileColour);
	if (isoMapper.cursorCoordinate.z !== 0) {
		var halfTileWidth = isoMapper.verticalLineHorizontalSpacing;
		var startX = isoMapper.coordinateToPositionX(isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y) - isoMapper.viewPosition.x;
		var startY = isoMapper.coordinateToPositionY(isoMapper.cursorCoordinate.x, isoMapper.cursorCoordinate.y) - isoMapper.viewPosition.y;

		var northWestX = 0.5 + startX;
		var northWestY = startY;
		var northX = northWestX + halfTileWidth;
		var northY = northWestY - isoMapper.tileLength / 2;
		var northEastX = northWestX + halfTileWidth * 2;
		var northEastY = northWestY;
		var centreX = northX;
		var centreY = northWestY + isoMapper.tileLength / 2;

		ctx.fillStyle = isoMapper.highlightTileColour.anchor;
		ctx.beginPath();
		ctx.moveTo(northWestX, northWestY);
		ctx.lineTo(northX, northY);
		ctx.lineTo(northEastX, northEastY);
		ctx.lineTo(centreX, centreY);
		ctx.closePath();
		ctx.fill();
	}
};

isoMapper.drawGraphicTile = function(ctx, coordinateX, coordinateY, coordinateZ, imgName){
	var startX = isoMapper.coordinateToPositionX(coordinateX, coordinateY) - isoMapper.viewPosition.x + isoMapper.verticalLineHorizontalSpacing;
	var startY = isoMapper.coordinateToPositionY(coordinateX, coordinateY) - isoMapper.viewPosition.y + (isoMapper.tileLength / 2) - (coordinateZ * isoMapper.tileLength / isoMapper.zSteps);

	var img = atlas.manifest[imgName] || atlas.manifest['missing-tile'];

	// image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
	ctx.drawImage(
		img.source,
		img.sourceX,
		img.sourceY,
		img.width,
		img.height,
		startX + img.offsetX + 0.5,
		startY + img.offsetY,
		img.width,
		img.height
	);
};

isoMapper.drawVectorTile = function(ctx, coordinateX, coordinateY, coordinateZ, colour){
	var halfTileWidth = isoMapper.verticalLineHorizontalSpacing;
	var startX = isoMapper.coordinateToPositionX(coordinateX, coordinateY) - isoMapper.viewPosition.x;
	var startY = isoMapper.coordinateToPositionY(coordinateX, coordinateY) - isoMapper.viewPosition.y - coordinateZ * isoMapper.tileLength / isoMapper.zSteps;

	var northWestX = 0.5 + startX;
	var northWestY = startY;
	var northX = northWestX + halfTileWidth;
	var northY = northWestY - isoMapper.tileLength / 2;
	var northEastX = northWestX + halfTileWidth * 2;
	var northEastY = northWestY;
	var centreX = northX;
	var centreY = northWestY + isoMapper.tileLength / 2;
	var southWestX = northWestX;
	var southWestY = northWestY + isoMapper.tileLength;
	var southX = centreX;
	var southY = centreY + isoMapper.tileLength;
	var southEastX = northEastX;
	var southEastY = northEastY + isoMapper.tileLength;

	ctx.fillStyle = colour.top;
	ctx.beginPath();
	ctx.moveTo(northWestX, northWestY);
	ctx.lineTo(northX, northY);
	ctx.lineTo(northEastX, northEastY);
	ctx.lineTo(centreX, centreY);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = colour.left;
	ctx.beginPath();
	ctx.moveTo(northWestX, northWestY);
	ctx.lineTo(centreX, centreY);
	ctx.lineTo(southX, southY);
	ctx.lineTo(southWestX, southWestY);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = colour.right;
	ctx.beginPath();
	ctx.moveTo(centreX, centreY);
	ctx.lineTo(northEastX, northEastY);
	ctx.lineTo(southEastX, southEastY);
	ctx.lineTo(southX, southY);
	ctx.closePath();
	ctx.fill();
};
