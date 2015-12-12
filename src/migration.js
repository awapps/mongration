'use strict';

var assert = require('assert');

var async = require('async');

var constants = require('./utils/constants');
var MongoConnection = require('./utils/mongo-connection');
var StepFileReader = require('./steps').Reader;

function Migration(dbConfig) {
	assert.notEqual(dbConfig.migrationCollection, null);

	this.dbConfig = dbConfig;
	this.steps = [];
	this.migrationFiles = [];
	this.collection = dbConfig.migrationCollection;
};

var validate = function(cb) {
	if(this.db){
		async.series(
			this.steps.map(function(step){
				return function(cb){
					this.db.collection(this.collection).findOne({ id : step.id}, cb);
				}.bind(this)
			}.bind(this)),
			function(err, data){
				assert.equal(err, null);

				var results = data.reduce(function(acc, el){
					if(el){
						acc[el.id] = el;
					}
					return acc;
				}, {});

				this.steps.forEach(function(step){
					var dbStep = results[step.id];
					if(dbStep){
						step.status = constants.skipped;
						if(dbStep.checksum != step.checksum){
							step.status = constants.error;
							cb("[" + dbStep.id + "] was already migrated in a different version. Current version[" + step.checksum + "] - Database version[" + dbStep.checksum + "]");
						}
					}else{
						step.status = constants.pending;				
					}
				});
				cb();
			}.bind(this)
		);
	}
};

var rollback = function(cb, error) {
	var reverseSteps = [].concat(this.steps).reverse();

	async.series(
		reverseSteps.map(function(step){
			return function(cb){
				if(step.status === constants.ok || step.status === constants.error){
					if(step.down){
						this.db.collection(this.collection).remove({id : step.id}, function(err){
							if(err){
								step.status = constants.rollbackError;
								return cb("[" + step.id + "] failed to remove migration version: " + err);
							}

							step.down(this.db, function(err){
								if(err){
									step.status = constants.rollbackError;
									return cb("[" + step.id + "] unable to rollback migration: " + err);
								}

								if(step.status === constants.ok){
									step.status = constants.rollback;
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
			this.steps = Object.assign([], this.steps, reverseSteps.reverse());
			cb(err || error);
		}.bind(this)
	);
};

Migration.prototype.add = function(fileList) {
	this.migrationFiles = this.migrationFiles.concat(fileList);
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

	this.migrationFiles.forEach(function(path){
		this.steps.push(new StepFileReader(path).read().getStep());
	}.bind(this));


	new MongoConnection(this.dbConfig).connect(function(err, db){
		assert.equal(err, null);		
		this.db = db;

		validate.call(this, function(err){
			if(err){
				return callback(err);
			}
			async.series(
				this.steps.map(function(step){
					return function(cb){
						if(step.status === constants.skipped){
							step.status = constants.skipped;
							cb();
						}else if(step.status === constants.pending){
							step.up(db, function(err){
								if(err){
									step.status = constants.error;
									return cb("[" + step.id + "] unable to complete migration: " + err);
								}

								this.db.collection(this.collection).insert({id : step.id, checksum : step.checksum}, function(err){
									if(err){
										step.status = constants.error;
										return cb("[" + step.id + "] failed to save migration version: " + err);
									}
									step.status = constants.ok;
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
	}.bind(this));
};

module.exports = Migration;