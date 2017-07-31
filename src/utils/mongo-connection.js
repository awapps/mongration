'use strict';

var assert = require('assert');

var MongoClient = require('mongodb').MongoClient;

function MongoConnection(config, options){
    this.options = options;

    if(config.mongoUri){
        this.connectionUri = config.mongoUri;
    }else{
        assert.notEqual(config.hosts, null);

        this.hosts = config.hosts;
        this.db = config.db;
        this.user = config.user;
        this.password = config.password;
        this.replicaSet = config.replicaSet;
    }
}

MongoConnection.prototype.connect = function(cb){
  MongoClient.connect(this.connectionUri || this.getConnectionUri(), this.options || null,
      function(err, db) {
        if(this.options.pass || this.options.user) {
          db.authenticate(this.options.user, this.options.pass, function(err) {
            if(err) {
              return cb(err);
            }
          })
        }

        return cb(err, db);
      }.bind(this));
}

MongoConnection.prototype.getConnectionUri = function(){
    var uri = 'mongodb://';

    if(this.user){
        uri += this.user;

        if(this.password){
            uri += ':' + this.password;
        }

        uri += '@';
    }
    uri += this.hosts + '/';

    if(this.db){
        uri += this.db;
    }

    if(this.replicaSet){
        uri += '?replicaSet=' + this.replicaSet;
    }

    return uri;
}

module.exports = MongoConnection;