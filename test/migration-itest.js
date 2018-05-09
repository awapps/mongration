var Mongration = require('../');
var Migration = Mongration.Migration;
var path = require('path');
var chai = require('chai');
var fs = require('fs');

var should = chai.should();
var expect = chai.expect;

var MongoConn = require('../src/utils/mongo-connection');
var config = require('./config');

function getFiles(relpath) {
    var dir = path.resolve(__dirname, relpath);
    return fs.readdirSync(dir).map(function (file) {
        return path.join(dir, file);
    });
}

describe('Mongration.Migration', function() {

    // uses real db so increase timeout and warning
    this.timeout(5000);
    this.slow(2000);

    var db;

    beforeEach(function (done) {
        // clean db for each test
        new MongoConn(config).connect(function (err, _db) {
            should.not.exist(err);
            _db.dropDatabase(function (err, result) {
                should.not.exist(err);
                db = _db
                done();
            });
        })
    });

    afterEach(function (done) {
        db.close(done);
    });

    it('runs migration', function(done) {
        var migration = new Migration(config);
        migration.add(getFiles('migrations/migrations-work'));

        migration.migrate(function(err, result) {
            should.not.exist(err);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result.should.have.deep.property('[0].id', '1');
            result.should.have.deep.property('[0].status', 'ok');
            done();
        });
    });

    it('skips already migrated steps', function(done) {
        var migration = new Migration(config);
        migration.add(getFiles('migrations/skips-old-migrations'));

        migration.migrate(function(err, result) {
            should.not.exist(err);
            var migration2 = new Migration(config);
            migration2.add(getFiles('migrations/skips-old-migrations'));

            migration2.migrate(function(err, result) {
                should.not.exist(err);
                result.should.be.an('array');
                result.should.have.lengthOf(1);
                result.should.have.deep.property('[0].id', '1');
                result.should.have.deep.property('[0].status', 'skipped');
                done();
            });
        });
    });

    it('rollback on failure', function(done) {
        var migration = new Migration(config);
        var dir = path.join(__dirname, 'migrations/failing-migration');
        migration.addAllFromPath(dir);

        migration.migrate(function(err, result) {
            err.should.match(/unable to complete migration:/);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result.should.have.deep.property('[0].id', '1');
            result.should.have.deep.property('[0].status', 'error');
            done();
        });
    });

    it('reports rollback failure', function(done) {
        var migration = new Migration(config);
        var dir = path.join(__dirname, 'migrations/failing-migration-and-rollback');
        migration.addAllFromPath(dir);

        migration.migrate(function(err, result) {
            err.should.match(/unable to rollback migration:/);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result.should.have.deep.property('[0].id', '1');
            result.should.have.deep.property('[0].status', 'rollback-error');
            done();
        });
    });

    it('rollback skips missing down methods', function(done) {
        var migration = new Migration(config);
        var dir = path.join(__dirname, 'migrations/ignore-missing-down');
        migration.addAllFromPath(dir);

        migration.migrate(function(err, result) {
            err.should.match(/unable to complete migration:/);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result.should.have.deep.property('[0].id', '1');
            result.should.have.deep.property('[0].status', 'error');
            done();
        });
    });

    it('does rollback if checksum changed', function(done) {
        var migration = new Migration(config);
        var files = getFiles('migrations/rejects-if-edited');
        migration.add(files[0]);

        migration.migrate(function(err, result) {
            should.not.exist(err);
            var migration2 = new Migration(config);
            migration2.add(files[1]); // "edited": same id, different content

            migration2.migrate(function(err, result) {
                err.should.match(/already migrated(.*)in a different version/)
                result.should.be.an('array');
                result.should.have.lengthOf(1);
                result.should.have.deep.property('[0].id', '1');
                result.should.have.deep.property('[0].status', 'error');
                done();
            });
        });
    });

    it('does skip if checksum changed', function(done) {
        var migration = new Migration(config);
        var files = getFiles('migrations/rejects-if-edited');
        migration.add(files[0]);
        migration.migrate(function(err, result) {
            should.not.exist(err);
            var migration2 = new Migration(config, {ignoreChecksum: true});
            migration2.add(files[1]); // "edited": same id, different content

            migration2.migrate(function(err, result) {
                should.not.exist(err);
                result.should.be.an('array');
                result.should.have.lengthOf(1);
                result.should.have.deep.property('[0].id', '1');
                result.should.have.deep.property('[0].status', 'skipped');
                done();
            });
        });
    });

    it('does rollback if order changed', function(done) {
        var migration = new Migration(config);
        var files = getFiles('migrations/migration-order');
        migration.add(files[1]);

        migration.migrate(function(err, result) {
            should.not.exist(err);
            var migration2 = new Migration(config);
            migration2.add([files[0], files[1]]);

            migration2.migrate(function(err, result) {
                err.should.match(/already migrated(.*)in a different order/)
                result.should.be.an('array');
                result.should.have.lengthOf(2);
                result.should.have.deep.property('[0].id', '1');
                result.should.have.deep.property('[0].status', 'not-run');
                result.should.have.deep.property('[1].id', '2');
                result.should.have.deep.property('[1].status', 'error');
                done();
            });
        });
    });

    it('does skip if order changed', function(done) {
        var migration = new Migration(config);
        var files = getFiles('migrations/migration-order');
        migration.add(files[1]);
        migration.migrate(function(err, result) {
            should.not.exist(err);
            var migration2 = new Migration(config, {ignoreOrder: true});
            migration2.add([files[0], files[1]]);

            migration2.migrate(function(err, result) {
                should.not.exist(err);
                result.should.be.an('array');
                result.should.have.lengthOf(2);
                result.should.have.deep.property('[0].id', '1');
                result.should.have.deep.property('[1].id', '2');
                result.should.have.deep.property('[0].status', 'ok');
                result.should.have.deep.property('[1].status', 'skipped');
                done();
            });
        });
    });


});
