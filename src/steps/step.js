'use strict';

var assert = require('assert');

var constants = require('../utils/constants');

function Step(obj){
	assert.notEqual(obj.id, null);
	assert.notEqual(obj.up, null);

	this.id = obj.id;
	this.up = obj.up;
	this.down = obj.down;
	this.checksum = obj.checksum;
	this.status = constants.notRun;
}

module.exports = Step;