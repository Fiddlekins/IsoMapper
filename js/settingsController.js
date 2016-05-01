'use strict';

var defaultSettings = {
	'ui': {
		'tools': {
			'left': '5px',
			'top': '5px'
		},
		'palette': {
			'left': '5px',
			'top': '97px',
			'width': '315px',
			'height': '200px'
		}
	}
};

var settings = {};

var settingsController = {
	save: function(){
		localStorage['settings'] = JSON.stringify(settings);
	},
	load: function(){
		settingsController.reset();
		if (localStorage['settings']) {
			var savedSettings = JSON.parse(localStorage['settings']);
			settingsController.copySettings(settings, savedSettings);
		}
	},
	reset: function(){
		settings = settingsController.clone(defaultSettings);
	},
	clone: function(sourceNode){
		return JSON.parse(JSON.stringify(sourceNode));
	},
	copySettings: function(targetNode, sourceNode){
		for (var property in targetNode) {
			if (targetNode.hasOwnProperty(property) && sourceNode.hasOwnProperty(property)) {
				var targetSetting = targetNode[property];
				var sourceSetting = sourceNode[property];
				if (!Array.isArray(targetSetting) && typeof targetSetting === 'object') {
					if (!Array.isArray(sourceSetting) && typeof sourceSetting === 'object') {
						settingsController.copySettings(targetSetting, sourceSetting);
					} else {
						// Keep default setting
					}
				} else {
					if (Array.isArray(targetSetting) && Array.isArray(sourceSetting)) {
						targetNode[property] = sourceNode[property];
					} else if (!Array.isArray(targetSetting) && !Array.isArray(sourceSetting)) {
						targetNode[property] = sourceNode[property];
					} else {
						// If array types don't match keep default setting
					}
				}
			}
		}
	}
};

settingsController.load();