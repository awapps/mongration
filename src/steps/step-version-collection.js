'use strict';

var assert = require('assert');

function VersionCollectionStep(id, checksum, processedDate){
    assert.notEqual(id, null);
    assert.notEqual(checksum, null);
    
    this.id = id;
    this.checksum = checksum;
    this.date = processedDate;
}

module.exports = VersionCollectionStep;