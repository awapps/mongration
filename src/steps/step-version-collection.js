'use strict';

var assert = require('assert');

function VersionCollectionStep(id, checksum, order, processedDate){
    assert.notEqual(id, null);
    assert.notEqual(checksum, null);
    assert.notEqual(order, null);
    
    this.id = id;
    this.checksum = checksum;
    this.order = order;
    this.date = processedDate;
}

module.exports = VersionCollectionStep;