# mongration [![build status](https://travis-ci.org/awapps/mongration.svg?branch=master)](https://travis-ci.org/awapps/mongration) [![NPM version](http://img.shields.io/npm/v/mongration.svg)](https://www.npmjs.org/package/mongration)

> A node.js migration framework for MongoDB.

This is a javascript framework that connects to a mongoDB and run the migrations following the specified order.
It is very different from other migration projects because of: 
* **checksum** — issues an error whenever a change on an already migrated file was changed,
* **persists migration state** — all migrations are persisted on database,
* **migration order** — guarantees migration order
* **replica sets** — replica sets are fully suported,
* **rollback** — rollback process is automatically started whenever an error happens during a migration,
* **sync / async migrations** — developers can run multiple migrations in sync or async ways,
* **multiple databases migrations** — developers can run multiple databases migrations sync / asynchronously


**Table of Contents**  

- [Programmatic Usage](#programmatic-usage)
  - [Configuration](#configuration)
  - [Creating `Migration` object](#creating-migration-object)
  - [Creating migration steps](#creating-migration-steps)
  - [Adding steps to migration](#adding-steps-to-migration)  
    - [Multiple queries example](#multiple-queries-example)
  - [Running migrations](#running-migrations)
    - [Migration outputs](#migration-outputs)
        - [Status ok](#status-ok)
        - [Status skipped](#status-skipped)
        - [Status error](#status-error)
        - [Status rollback](#status-rollback)
        - [Status rollback-error](#status-rollback-error)
        - [Status not-run](#status-not-run)
- [Command line Usage](#command-line-usage)
- [Included features](#included-features)
  - [Checksum](#checksum)
  - [Migration state persisted](#migration-state-persisted)
  - [Migration Order](#migration-order)
  - [Replica set support](#replica-set-support)
  - [Rollback](#rollback)
  - [Sync and async migrations](#sync-and-async-migrations)
    - [Sync migration step](#sync-migration-step)
    - [Async migration step](#async-migration-step)
  - [Multiple databases migrations](#multiple-databases-migrations)
- [License](#license)
  



## Programmatic Usage

It's a regular node module, just `npm install` and `require` it:


```bash
  npm install mongration --save
```

```javascript
var Migration = require('mongration').Migration;
```


### Configuration

The configuration object is a straightforward javascript object that contains the MongoDb access and the collection that will be used to save the migration state:

```javascript
module.exports = {
   hosts: 'my.host.com:27017',
   db: 'mydb',
   user : 'myuser',
   password : 'mypass',
   mongoUri : 'mongodb://myuser:mypass@my.host.com:27017/mydb',
   migrationCollection: 'migrationversion'
}
```

The **migrationCollection** configuration is **always required**. This is the collection name where the [migration state is persisted](#migration-state-persisted).

You can either specifiy connection parameters separately, or the entire **mongoUri** with all the connection parameters.
If you decide to go with the splitted params, **hosts** parameter is required. 

Please use **user** and **password** params only when authentication is required.


### Creating `Migration` object

Simply `require` mongration constructor and initialize it with your [configuration](#configuration):

```javascript
var mydbConfig = require('./config');

var Migration = require('mongration').Migration;
var mydbMigration = new Migration(mydbConfig);
```


### Creating migration steps

A migration step is a regular javascript object which has 3 properties: 
* `id` — Migration step ID **must be unique** (**required**): Will be used to save migration state on database
* `up` — Migration script itself (**required**): Uses MongoDB [native driver](http://mongodb.github.io/node-mongodb-native/) to run commands on database
* `down` — Rollback script itself (*optional*): Will be used to [Rollback](#rollback) changes in case migration has any error

```javascript
module.exports = {
    id: '1-step',

    up : function(db, cb){
        db.collection('testcollection').insert({ name: 'initial-setup' }, cb);
    },

    down : function(db, cb){
        db.collection('testcollection').remove({ name: 'initial-setup' }, cb);
    }
}
```

Both `up` and `down` receive two parameters: **db** (MongoDB connection) and **cb** (a callback function that will tell the framework that the step has been completed with / out errors).


### Adding steps to migration

`Migration` object exposes an `add` method which receives both single or bulk migration steps. You must provide the migration file path to this framework so it can read it and run [checksum](#checksum) security routine.

We suggest [nodejs path module](https://nodejs.org/api/path.html) to discover migration step absolute path:

```javascript
var path = require('path');

// adding bulk
mydbMigration.add([
    path.join(__dirname, './migrations-folder/1-step.js'),
    path.join(__dirname, './migrations-folder/2-step.js')
]);

// adding single
mydbMigration.add(path.join(__dirname, './migrations-folder/3-step.js'));
```


#### Multiple queries example

This framework supports multiple queries within the same migration step — developer just needs to handle local callbacks (between queries) and call framework back whenever the whole step is done.

We strongly suggest you to use [async module](https://www.npmjs.com/package/async) to handle asynchronous javascript. Multiple queries example:

```javascript
var async = require('async');

module.exports = {
    id: 'my-migration-step-with-multiple-commands',
    
    up : function(db, cb){
        async.series(
            [
                function(_cb){db.collection('testcollection').insert({ name: 'initial-setup' }, _cb)},
                function(_cb){db.collection('othercollection').insert({ name: 'second-setup' }, _cb)},
                function(_cb){db.collection('othercollection').insert({ name: 'third-setup' }, _cb)}
            ],
            cb
        );  
    }
}
```


### Running migrations

After adding all steps to your migration, you simply need to run it like:

```javascript
mydbMigration.migrate(function(err, results){});
```

The `migrate` callback function receives 2 parameters:
* `err` — Error message (if the migration did not run properly)
* `results` — A list of status for each migration step. See more on [Migration outputs](#migration-outputs).

For a complete example, check [samples folder](samples/).


#### Migration outputs

All migration steps will have an output so developers know how *exactly* their migrations were performed.

##### Status ok
The migration step was **successfully performed** in the database. This step is saved in the database.

##### Status skipped
The migration step was skipped because **it was already performed** in a previous migration. This step was already saved in the database.

##### Status error
The migration **step returned an error** and the rollback process was called. The error details are returned on `migration.migrate()` callback as described in [Running migrations](#running-migrations). This step was not saved in the database.

##### Status rollback
Although the migration step was successfully performed, the [rollback](#rollback) process was called due to **an error in a step after this one**. This step is not saved in the database.

##### Status rollback-error
An error happened during migration process and **this step rollback process was not successfully completed**. The error details are returned on `migration.migrate()` callback as described in [Running migrations](#running-migrations). This step was not saved in the database - however database may contain unexpected data since rollback was not completely done.

##### Status not-run
The migration step **was not processed** because an error happened before getting into this step. This step is not saved in the database.


## Command line Usage

Read the [CLI tool docs](bin/README.md).


## Included features

This framework was built focused on solving real problems. For that, we have already included the features below.


### Checksum

Whenever a migration step is successfully performed, the step file **checksum** is saved on the database.
*Checksum* is the sum of all step file characters.

Example:
If migration step *1-changed-step-sample* was succesfully run, then a developer changes any part of it and try to run it again, the migration step will have **status : error ** and the exception below will be triggered:
```javascript
"[1-changed-step-sample] was already migrated in a different version. Current version[0685c17d538741a062c488ea776b0576] - Database version[72d9204bee94542118bd99cdde8edc0f]"
```


### Migration Order

It makes sure that previsouly ran migrations will be rerun on the same order and, if developers changed the migration order, the migration step will have **status : error ** and the exception below will be triggered:
```javascript
"[1-step-sample] was already migrated on [Sat Dec 19 2015 10:18:27 GMT-0200 (BRST)] in a different order. Database order[1] - Current migration on this order[1-reordered-step-sample]"
```


### Migration state persisted

The migration state is saved on the **migrationCollection** defined on [configuration](#configuration):
```javascript
db.migrationversion.find()
{ "id" : "1-simple-query-sample", "checksum" : "a10e3030bb9683a971bae1f95b986033", order : "0", "date" : ISODate("2015-12-18T14:28:38.149Z") }
{ "id" : "2-multi-parallel-query", "checksum" : "3999fbcdf95d4c4a06e839cd0c66ede5", order : "1", "date" : ISODate("2015-12-18T14:28:38.187Z") }
{ "id" : "3-multi-sequential-query", "checksum" : "1181db9b787251df92fd9fb676da2d76", order : "2", "date" : ISODate("2015-12-18T14:28:38.287Z") }
```

The framework automatically saves the following data as migration state:
* `id` — ID defined on each migration step
* `checksum` — Checksum of migration step file that will be used to compare as part of future migrations
* `order` — Order the step was run
* `date` — When the migration step was processed


### Replica set support

As describred above, this framework supports migrations on both MongoDB standalone and replica sets versions. 
To connect to a replica set, enter your **replicaSet** name and add the replica set **hosts** on your [Configuration](#configuration):

```javascript
module.exports = {
    //...
    // with splitted params
    hosts: 'my.host.com:27017,my.otherhost.com:27018,my.backuphost.com:27019',
    replicaSet : 'myreplica',
   
    // or complete connection string
    mongoUri: 'mongodb://my.host.com:27017,my.otherhost.com:27018,my.backuphost.com:27019/mydb?replicaSet=myreplica'
}
```


### Rollback

Whenever an error happens during a migration step, the rollback process is automatically called.
The rollback process basically consists in calling `down` method of every step that was previously marked as **ok** or **error** - in other words: Skipped (previously ran steps) migration steps **are not rolled back**.

Please consider that steps without `down` methods will be automatically skipped when rollback process is called.
Please check [Migration outputs](#migration-outputs) to understand how rollback modifies steps' statuses.


### Sync and async migrations

Developers can run multiple queries (sync or async) as part of the same migration step.

#### Sync migration step
Please see below an example on how to run multiple **synchronous** queries as part of one migration step:
```javascript
var async = require('async');

module.exports = {
    id: 'sequential-query',

    up : function(db, cb){
        async.series(
            [
                function(cb){db.collection('testcollection').insert({ name: 'initial-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'second-sequential-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'third-sequential-setup' }, cb)}
            ],
            cb
        );
    }
}
```

#### Async migration step
Please see below an example on how to run multiple **asynchronous** queries as part of one migration step:
```javascript
var async = require('async');

module.exports = {
    id: 'parallel-query',

    up : function(db, cb){
        async.parallel(
            [
                function(cb){db.collection('testcollection').insert({ name: 'initial-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'second-parallel-setup' }, cb)},
                function(cb){db.collection('testcollection').insert({ name: 'third-parallel-setup' }, cb)}
            ],
            cb
        );
    }
}
```


### Multiple databases migrations

You have the ability to run migrations in more than one database at the same time. Please check the [Multi DB samples](samples/02-multi-db).


## License

The MIT License (MIT)

Copyright (c) 2015 Andre Eberhardt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
