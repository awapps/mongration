'use strict';

var async = require('async');

module.exports = {
    id: '3-multi-sequential-query',

    up : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').insert({ name: 'initial-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'second-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'third-sequential-setup' }, cb)}
            ],
            cb
        );
    },

    down : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').remove({ name: 'initial-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').remove({ name: 'second-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').remove({ name: 'third-sequential-setup' }, cb)}
            ],
            cb
        );
    }
}