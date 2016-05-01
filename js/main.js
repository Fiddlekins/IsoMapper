'use strict';
// Execute all this after the rest is done and ready

isoMapper.generateGrid();
isoMapper.view.reset();
window.requestAnimationFrame(isoMapper.draw);
