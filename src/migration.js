'use strict';

var assert = require('assert');

var async = require('async');
var fs = require('fs');
var path = require('path');

var merge = require("lodash/merge");

var statuses = require('./utils/constants').statuses;
var MongoConnection = require('./utils/mongo-connection');
var StepFileReader = require('./steps').Reader;
var StepVersionCollection = require('./steps').VersionCollection;
var utilities = require('./utils/utility-functions');

function Migration(dbConfig) {
    assert.notEqual(dbConfig.migrationCollection, null);

    this.dbConfig = dbConfig;
    this.steps = [];
    this.migrationFiles = [];
    this.collection = dbConfig.migrationCollection;
};

var validate = function(cb) {
    if(this.db){
        this.db.collection(this.collection).find({}, {}).sort({order : 1}).toArray()
          .then((docs) => {
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
          })
          .catch(cb);
    }
};

var rollback = function(cb, error) {
    var reverseSteps = [].concat(this.steps).reverse();
    console.log('rollingback', reverseSteps)
    async.series(
        reverseSteps.map(function(step){
            return function(cb){
                console.log('$$$$$$$$$$$$ step.status', step.status)
                if(step.status === statuses.ok || step.status === statuses.error){
                  console.log('$$$$$$$$$$$$ DOWN', step.down)
                    if(step.down){
                      this.db.collection(this.collection).deleteOne({id : step.id})
                        .then(() => {
                            console.log('(((((((((((((((((')
                            step.down(this.db, function(err){
                              console.log('stepping down', err)
                              if(err){
                                  step.status = statuses.rollbackError;
                                  return cb("[" + step.id + "] unable to rollback migration: " + err);
                              }
                              console.log('stepping down was good')
                              if(step.status === statuses.ok){
                                  step.status = statuses.rollback;
                              }
                              cb();
                            }.bind(this)
                            );
                        })
                        .catch((err) => {
                          console.log('))))))))))))))))x')
                          step.status = statuses.rollbackError;
                          cb("[" + step.id + "] failed to remove migration version: " + err);
                        });
                    }else{
                        console.log('********************')
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
        this.client
          .close()
          .then(() => doneCb(null, resp))
          .catch((err) => doneCb(err, resp));
    }.bind(this);
    console.log('!!!!!!!!!!!!')
    this.migrationFiles.forEach(function(path, index){
        var _step = new StepFileReader(path).read().getStep();
        _step.order = index;
        this.steps.push(_step);
    }.bind(this));
    console.log('@@@@@@@@@')
    new MongoConnection(this.dbConfig).connect(function(err, client){
        assert.equal(err, null);
        this.client = client;
        console.log('--------&&&&&&&&')
        this.db = client.db(client.s.options.dbName);

        validate.call(this, function(err){
            if(err){
                return callback(err);
            }
            async.series(
                this.steps.map(function(step){
                    return function(cb){
                        if(step.status === statuses.skipped){
                            console.log('skipped%%%%%%%%%%%%%%')
                            step.status = statuses.skipped;
                            cb();
                        }else if(step.status === statuses.pending){
                            console.log('pending%%%%%%%%%%%%%%')
                            step.up(this.db, function(err){
                                console.log('up#######', err);
                                if(err){
                                    console.log('unable to complete migrations----', err.message)
                                    step.status = statuses.error;
                                    return cb("[" + step.id + "] unable to complete migration: " + err);
                                }

                                this.db.collection(this.collection).insertOne(new StepVersionCollection(step.id, step.checksum, step.order, new Date()))
                                  .then(() => {
                                    step.status = statuses.ok;
                                    cb();
                                  })
                                  .catch((err) => {
                                    step.status = statuses.error;
                                    cb("[" + step.id + "] failed to save migration version: " + err);
                                  });
                            }.bind(this));
                        }
                    }.bind(this)
                }.bind(this)),

                function(err){
                    console.log('async series', err)
                    if(err){
                        rollback.call(this, callback, err);
                    }else{
                        callback();
                    }
                }.bind(this)
            );
        }.bind(this));
    }.bind(this));
};

module.exports = Migration;
