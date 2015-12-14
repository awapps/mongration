'use strict';

module.exports = {
    id: '1-simple-query-sample',

    up : function(db, cb){
        db.collection('testcollection').insert({ name: 'initial-setup' }, cb);
    },

    down : function(db, cb){
        db.collection('testcollection').remove({ name: 'initial-setup' }, cb);
    }
}