module.exports = {
    id: '1',

    up: function(db, cb) {
        cb(new Error());
    },

    down: function(db, cb) {
        cb();
    }
};
