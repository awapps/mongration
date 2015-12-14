'use strict';

var path = require('path');
var Migration = require('mongration').Migration;

var db3Config = {
	hosts: '10.0.2.15',
	db: 'mydb3',
	migrationCollection: 'migrationversion'
};

var db3Migration = new Migration(db3Config);

db3Migration.add([
	path.join(__dirname, './migration-steps/1-simple-query-sample.js')
]);

module.exports = {
	migration : db3Migration
}