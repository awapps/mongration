'use strict';

var assert = require('assert');

var statuses = require('../utils/constants').statuses;

function Step(obj){
    assert.notEqual(obj.id, null);
    assert.notEqual(obj.up, null);

    this.id = obj.id;
    this.up = obj.up;
    this.down = obj.down;
    this.checksum = obj.checksum;
    this.status = statuses.notRun;
    this.order = obj.order;
}

module.exports = Step;