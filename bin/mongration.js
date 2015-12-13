#!/usr/bin/env node

var mongration = require('commander');
var path = require('path');
var fs = require('fs');
var chalk = require('chalk');

require('table-master');

var Mongration = require('../');

mongration.
    version('0.0.3').
    option('-f, --folder [value]', 'migrations folder (current dir is default)').
    option('-h, --hosts [value]', 'mongoDB hosts').
    option('-d, --database [value]', 'mongoDB database').
    option('-u, --user [value]', 'mongoDB user').
    option('-p, --password [value]', 'mongoDB password').
    option('-m, --migration-collection [value]', 'collection to save migrations state').
    option('-c, --config [value]', 'path to config file').
    parse(process.argv);

var config = {};

if(mongration.config) {
    config = require(path.resolve(mongration.config));
}

config = Object.assign({}, config, {
    hosts: mongration.hosts || config.hosts || '',
    db: mongration.database || config.database || '',
    user: mongration.user || config.user || '',
    password: mongration.password || config.password || '',
    migrationCollection: mongration.migrationCollection || config.migrationCollection || '',
    migrationsFolder: path.resolve(mongration.folder || config.folder || './')
});

var files = fs.readdirSync(config.migrationsFolder);

var filePaths = files.map(function(file) {
    return path.resolve(__dirname, config.migrationsFolder + '/' + file);
});

var migration = new Mongration.Migration(config);

migration.add(filePaths);

console.log(chalk.blue('Mongration - Migration Runnner'));
console.log(chalk.blue('=============================='));
console.log('');

var statusesColors = {
    'ok': 'green',
    'skipped': 'green',
    'error': 'red',
    'rollback': 'yellow',
    'rollback-error': 'red'
};

migration.migrate(function(err, results) {
    console.table(
        results.map(function(result) {
            var color = statusesColors[result.status] || 'reset';

            return {
                'Migration': chalk[color](result.id),
                'Status': chalk[color](result.status)
            };
        })
    );
});
