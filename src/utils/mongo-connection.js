'use strict';

var assert = require('assert');

var MongoClient = require('mongodb').MongoClient;

function MongoConnection(config){
    
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

MongoConnection.prototype.connect = async function(cb){

    var client = new MongoClient(this.connectionUri || this.getConnectionUri());

    try {
        await client.connect();
        cb(null, client);
    } catch (e) {
        cb(e);
    }
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