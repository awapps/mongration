'use strict';

var assert = require('assert');

var async = require('async');
var fs = require('fs');
var path = require('path');

var merge = require("lodash.merge");

var statuses = require('./utils/constants').statuses;
var MongoConnection = require('./utils/mongo-connection');
var StepFileReader = require('./steps').Reader;
var StepVersionCollection = require('./steps').VersionCollection;
var utilities = require('./utils/utility-functions');

function Migration(dbConfig, options) {
    assert.notEqual(dbConfig.migrationCollection, null);

    this.options = options;
    this.dbConfig = dbConfig;
    this.steps = [];
    this.migrationFiles = [];
    this.collection = dbConfig.migrationCollection;
};

var validate = function(cb) {
    if(this.db){

        this.db.collection(this.collection).find({}, {}, {order : 1}).toArray(function(err, docs){
            assert.equal(err, null);
            var _steps = utilities.arrayToObject(this.steps, 'id');

            docs.forEach(function(dbStep, index){
                if(this.steps[index]){
                    this.steps[index].status = statuses.skipped;   

                    if(!_steps[dbStep.id] || (dbStep.order && dbStep.order != _steps[dbStep.id].order)){
                        this.steps[index].status = statuses.error;
                        cb("[" + dbStep.id + "] was already migrated on [" + dbStep.date + "] in a different order. Database order[" + dbStep.order + "] - Current migration on this order[" + this.steps[index].id + "]");
                    }else if(dbStep.checksum != this.steps[index].checksum){
                        this.steps[index].status = statuses.error;
                        cb("[" + dbStep.id + "] was already migrated on [" + dbStep.date + "] in a different version. Database version[" + dbStep.checksum + "] - Current version[" + this.steps[index].checksum + "]");
                    }
                }
            }.bind(this));

            this.steps = this.steps.map(function(step){
                if(step.status === statuses.notRun){
                    step.status = statuses.pending;
                }
                return step;
            });
            cb();
        }.bind(this));
    }
};

var rollback = function(cb, error) {
    var reverseSteps = [].concat(this.steps).reverse();

    async.series(
        reverseSteps.map(function(step){
            return function(cb){
                if(step.status === statuses.ok || step.status === statuses.error){
                    if(step.down){
                        this.db.collection(this.collection).remove({id : step.id}, function(err){
                            if(err){
                                step.status = statuses.rollbackError;
                                return cb("[" + step.id + "] failed to remove migration version: " + err);
                            }

                            step.down(this.db, function(err){
                                if(err){
                                    step.status = statuses.rollbackError;
                                    return cb("[" + step.id + "] unable to rollback migration: " + err);
                                }

                                if(step.status === statuses.ok){
                                    step.status = statuses.rollback;
                                }
                                cb();
                            }.bind(this)
                            );
                        }.bind(this));
                    }else{
                        console.warn("[" + step.id + "] - Skipping rollback due to missing `down` property");
                        cb();
                    }
                }else{
                    cb();
                }
            }.bind(this)
        }.bind(this)),
        
        function(err, results){
            this.steps = merge(this.steps, reverseSteps.reverse());
            cb(err || error);
        }.bind(this)
    );
};

Migration.prototype.add = function(fileList) {
    this.migrationFiles = this.migrationFiles.concat(fileList);
};

Migration.prototype.addAllFromPath = function(dirpath) {
    var fileList = fs.readdirSync(dirpath);
    fileList.map(function(file){
        this.migrationFiles = this.migrationFiles.concat(path.join(dirpath, file));
    }.bind(this));
};

Migration.prototype.migrate = function(doneCb) {
    var callback = function(err){
        var resp = this.steps.map(function(step){
            return {
                id : step.id,
                status : step.status
            }
        });
        this.db.close();
        doneCb(err, resp);
    }.bind(this);

    this.migrationFiles.forEach(function(path, index){
        var _step = new StepFileReader(path).read().getStep();
        _step.order = index;
        this.steps.push(_step);
    }.bind(this));

    new MongoConnection(this.dbConfig, this.options).connect(function(err, db){
        var runMigrations = function() {
          assert.equal(err, null);

          //TODO: handle error
          if(err) {
            console.log(err);
          }
          this.db = db;

          validate.call(this, function(err){
            if(err){
              return callback(err);
            }
            async.series(
                this.steps.map(function(step){
                  return function(cb){
                    if(step.status === statuses.skipped){
                      step.status = statuses.skipped;
                      cb();
                    }else if(step.status === statuses.pending){
                      step.up(db, function(err){
                        if(err){
                          step.status = statuses.error;
                          return cb("[" + step.id + "] unable to complete migration: " + err);
                        }

                        this.db.collection(this.collection).insert(new StepVersionCollection(step.id, step.checksum, step.order, new Date()), function(err){
                          if(err){
                            step.status = statuses.error;
                            return cb("[" + step.id + "] failed to save migration version: " + err);
                          }
                          step.status = statuses.ok;
                          cb();
                        });
                      }.bind(this));
                    }
                  }.bind(this)
                }.bind(this)),

                function(err){
                  if(err){
                    rollback.call(this, callback, err);
                  }else{
                    callback();
                  }
                }.bind(this)
            );
          }.bind(this));
        }

        if(this.options.pass || this.options.user) {
          var adminDb = db.admin();
          adminDb.authenticate(this.options.user, this.options.pass, function(err) {
              if(err) {
              //TODO: handle error
                console.log(err)
              }
            runMigrations()
          })
        }else {
          runMigrations();
        }
    }.bind(this));
};

module.exports = Migration;