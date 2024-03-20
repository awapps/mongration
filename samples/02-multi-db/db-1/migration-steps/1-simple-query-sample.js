'use strict';

module.exports = {
    id: '1-simple-query-sample',

    up : function(db, cb){
        db.collection('testcollection').insertOne({ name: 'initial-setup' }, cb);
    },

    down : function(db, cb){
        db.collection('testcollection').deleteOne({ name: 'initial-setup' }, cb);
    }
}