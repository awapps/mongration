'use strict';

require('./db-1').migration.migrate(function(err, results){
    console.log(err, results);
});

require('./db-2').migration.migrate(function(err, results){
    console.log(err, results);
});

require('./db-3').migration.migrate(function(err, results){
    console.log(err, results);
});