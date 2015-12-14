'use strict';

var path = require('path');
var Migration = require('mongration').Migration;

var db2Config = {
	hosts: '10.0.2.15',
	db: 'mydb2',
	migrationCollection: 'migrationversion'
};

var db2Migration = new Migration(db2Config);

db2Migration.add([
	path.join(__dirname, './migration-steps/1-simple-query-sample.js')
]);

module.exports = {
	migration : db2Migration
}