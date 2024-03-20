var Mongration = require('../');
var Migration = Mongration.Migration;
var path = require('path');
var chai = require('chai');
var fs = require('fs');
const util = require('util');

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

    var client;
    let dbName;

    beforeEach(function (done) {
        // clean db for each test
        new MongoConn(config).connect(function (err, _client) {
            should.not.exist(err);
            _client
              .db('mydb')
              .dropDatabase()
              .then(() => {
                client = _client
                done();
              })
              .catch(done);
        })
    });

    afterEach(function (done) {
        client.close()
          .then(done)
          .catch(done);
    });

    it('runs migration', function(done) {
        var migration = new Migration(config);
        migration.add(getFiles('migrations/migrations-work'));

        migration.migrate(function(err, result) {
          console.log('=====', err, result)
            should.not.exist(err);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result[0].should.deep.equal({id: '1', status: 'ok'});
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
                result[0].should.deep.equal({id: '1', status: 'skipped'});
                done();
            });
        });
    });

    it('rollback on failure', function(done) {
        var migration = new Migration(config);
        var dir = path.join(__dirname, 'migrations/failing-migration');
        migration.addAllFromPath(dir);

        migration.migrate(function(err, result) {
            console.log('#######=====', err, result)
            //err.should.match(/unable to complete migration:/);
            result.should.be.an('array');
            result.should.have.lengthOf(1);
            result[0].should.deep.equal({id: '1', status: 'error'});
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
            result[0].should.deep.equal({id: '1', status: 'rollback-error'});
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
            result[0].should.deep.equal({id: '1', status: 'error'});
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
                result[0].should.deep.equal({id: '1', status: 'error'});
                done();
            });
        });
    });

    // TODO: add test...
    // dunno how to trigger error "already migrated in a different order"
    it('does rollback if wrong order');


});
