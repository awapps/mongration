var Mongration = require('../../');
var Migration = Mongration.Migration;
var path = require('path');
var chai = require('chai');
var fs = require('fs');

var config = require('../config');
var migration = new Migration(config, { stepConfig: { testParam: 1234 }});
var dir = path.resolve(path.dirname(__filename), './migrations');
var files = fs.readdirSync(dir);

var filesPath = files.map(function(file) {
    return path.resolve(dir, file);
});

var should = chai.should;

migration.add(filesPath);
describe('Run migrations', function() {
    it('Must not have errors', function() {
        migration.migrate(function(err, result) {
            should.not.exist(err);

            result.should.be.an('array');
            result.length.should.equal(filesPath.length);
        });
    });
});
