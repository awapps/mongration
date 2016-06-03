'use strict';

var assert = require('assert');
var fs = require('fs');
var md5 = require('md5');
var merge = require("lodash.merge");

var Step = require('./step');

function StepFile(path){
    assert.notEqual(path, null);
    
    this.path = path;
    this.content = null;
    this.checksum = null;
}

StepFile.prototype.read = function(){
    this.content = fs.readFileSync(this.path, {encoding : 'utf8'});
    this.checksum = md5(this.content);

    return this;
}

StepFile.prototype.getStep = function(stepConfig){
    var obj = require(this.path);
    return new Step(merge(obj, {checksum : this.checksum, stepConfig: stepConfig}));
}

module.exports = StepFile;