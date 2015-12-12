# mongration

> A node.js migration framework for MongoDB.

This is a javascript framework that connects to a mongoDB and run the migrations following the specified order.
It is very different from other similar projects because of: 
* **checksum** — issues an error whenever a change on an already migrated file was changed,
* **persists migration state** — all migrations are persisted on database,
* **replica sets** — replica sets are fully suported,
* **rollback** — rollback process is automatically started whenever an error happens during a migration,
* **sync / async migrations** — developers can run multiple migrations in sync or async ways,
* **multiple databases migrations** — developers can run multiple databases migrations sync / asynchronously


**Table of Contents**  

- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Creating `Migration` object](#creating-migration-object)
  - [Creating migration steps](#creating-migration-steps)
  - [Adding steps to the migration](#adding-steps-to-the-migration)  
    - [Multiple queries example](#multiple-queries-example)
  - [Running migrations](#running-migrations)
    - [Migration outputs](#migration-outputs)
- [Included features](#included-features)
  - [Checksum](#checksum)
  - [Migration state persisted](#migration-state-persisted)
  - [Replica set support](#replica-set-support)
  - [Rollback](#rollback)
  - [Sync and async migrations](#sync-and-async-migrations)
  - [Multiple databases migrations](#multiple-databases-migrations)
- [License](#license)
  


## Installation

```bash
  npm install mongration --save
```


## Usage

It's a simple node module, just `require` it:

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
   migrationCollection: 'migrationversion'
}
```

Both **hosts** and **migrationCollection** parameters are required. Please use **user** and **password** params only when authentication is required.


### Creating `Migration` object

Simply `require` mongration constructor and initialize it with your [Configuration](#configuration):

```javascript
var mydbConfig = require('./config');

var Migration = require('mongration').Migration;
var mydbMigration = new Migration(mydbConfig);
```


### Creating migration steps

`Migration` object exposes an `add` method which receives both single or bulk migration steps. This framework also makes use of [nodejs path module](https://nodejs.org/api/path.html) to discover migration step absolute path:

```javascript
var path = require('path');

// adding bulk
mydbMigration.add([
    path.join(__dirname, './migrations-folder/1-step.js'),
    path.join(__dirname, './migrations-folder/2-step.js')
]);

// adding single
migration.add(path.join(__dirname, './migrations-folder/3-step.js'));
```

*Having file path is required for [checksum](#checksum) security routine.*

### Adding steps to the migration

TBD


#### Multiple queries example

TBD


### Running migrations

TBD


#### Migration outputs

TBD


## Included features

TBD


### Checksum

TBD


### Migration state persisted

TBD


### Replica set support

As describred above, this framework supports migrations on both MongoDB standalone and replica sets versions. 
To connect to a replica set, enter your **replicaSet** name and add the replica set **hosts** on your [Configuration](#configuration):

```javascript
module.exports = {
   //...
   hosts: 'my.host.com:27017,my.otherhost.com:27018,my.backuphost.com:27019',
   replicaSet : 'myreplica',
}
```


### Rollback

TBD


### Sync and async migrations

TBD


### Multiple databases migrations

TBD


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