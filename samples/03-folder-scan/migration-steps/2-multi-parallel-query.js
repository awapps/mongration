'use strict';

var async = require('async');

module.exports = {
    id: '2-multi-parallel-query',

    up : function(db, cb){
        async.parallel(
            [
                function(cb){db.collection('testcollection').insert({ name: 'initial-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'second-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'third-parallel-setup' }, cb)}
            ],
            cb
        );
    },

    down : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').remove({ name: 'initial-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').remove({ name: 'second-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').remove({ name: 'third-parallel-setup' }, cb)}
            ],
            cb
        );
    }
}