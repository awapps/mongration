'use strict';

var async = require('async');

module.exports = {
    id: '2-multi-parallel-query',

    up : function(db, cb){
        async.parallel(
            [
                function(cb){db.collection('testcollection').insertOne({ name: 'initial-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').insertOne({ name: 'second-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').insertOne({ name: 'third-parallel-setup' }, cb)}
            ],
            cb
        );
    },

    down : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').deleteOne({ name: 'initial-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').deleteOne({ name: 'second-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').deleteOne({ name: 'third-parallel-setup' }, cb)}
            ],
            cb
        );
    }
}