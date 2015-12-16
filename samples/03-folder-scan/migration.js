'use strict';

var path = require('path');
var Migration = require('mongration').Migration;

var config = {
	hosts: 'localhost',
	db: 'mydb',
	migrationCollection: 'migrationversion'
};

var migration = new Migration(config);

migration.addAllFromPath(path.join(__dirname, './migration-steps/'));

migration.migrate(function(err, results){
    console.log(err, results);
});