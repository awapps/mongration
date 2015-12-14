'use strict';

var path = require('path');
var Migration = require('mongration').Migration;

var db1Config = {
	hosts: '10.0.2.15',
	db: 'mydb1',
	migrationCollection: 'mydb1migrationversion'
};

var db1Migration = new Migration(db1Config);

db1Migration.add([
	path.join(__dirname, './migration-steps/1-simple-query-sample.js')
]);

module.exports = {
	migration : db1Migration
}