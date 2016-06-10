module.exports = {
    id: '1',

    up: function(db, cb) {
        // This config param should be passed in via stepConfig.
        console.log('t1 here, config: ' + JSON.stringify(this.config));
        if (this.config.testParam !== 123) {
            throw new 'testParam was missing!';
        }
        cb();
    },

    down: function(db, cb) {
        cb();
    }
};
