var Mongration = require('../../');
var Migration = Mongration.Migration;
var path = require('path');
var chai = require('chai');
var fs = require('fs');

var MongoConn = require('../../src/utils/mongo-connection');
var config = require('../config');
var migration = new Migration(config);
var dir = path.resolve(path.dirname(__filename), './migrations');
var files = fs.readdirSync(dir);

var filesPath = files.map(function(file) {
    return path.resolve(dir, file);
});

var should = chai.should();
var expect = chai.expect;

migration.add(filesPath);

describe('Run migrations', function() {

    var db;

    before(function (done) {
        new MongoConn(config).connect(function (err, _db) {
            should.not.exist(err);
            db = _db;
            done();
        });
    })

    after(function (done) {
        db.dropDatabase(function (err, result) {
            should.not.exist(err);
            db.close(done);
        });
    });

    it('Must not have errors', function(done) {
        migration.migrate(function(err, result) {
            should.not.exist(err);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result.should.have.deep.property('[0].id', '1');
            result.should.have.deep.property('[0].status', 'ok');
            done();
        });
    });

});
