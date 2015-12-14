'use strict';

var path = require('path');
var Migration = require('mongration').Migration;

var config = {
	hosts: '10.0.2.15',
	db: 'mydb',
	migrationCollection: 'migrationversion'
};

var migration = new Migration(config);

migration.add([
	path.join(__dirname, './migration-steps/1-simple-query-sample.js'),
	path.join(__dirname, './migration-steps/2-multi-parallel-query.js'),
	path.join(__dirname, './migration-steps/3-multi-sequential-query.js')
]);

migration.migrate(function(err, results){
    console.log(err, results);
});