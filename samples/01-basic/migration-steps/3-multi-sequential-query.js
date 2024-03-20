'use strict';

var async = require('async');

module.exports = {
    id: '3-multi-sequential-query',

    up : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').insertOne({ name: 'initial-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').insertOne({ name: 'second-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').insertOne({ name: 'third-sequential-setup' }, cb)}
            ],
            cb
        );
    },

    down : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').deleteOne({ name: 'initial-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').deleteOne({ name: 'second-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').deleteOne({ name: 'third-sequential-setup' }, cb)}
            ],
            cb
        );
    }
}