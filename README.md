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

TBD


### Configuration

The configuration object is a straightforward javascript object that contains the MongoDb access and the collection that will be used to save the migration state:

```javascript
module.exports = {
  hosts: 'my.host.com:27017',
  db: 'mydb',
  user : 'myuser',
  password : 'mypass',
  replicaSet : 'myreplica',
  migrationCollection: 'migrationversion'
}
```

Both **hosts** and **migrationCollection** parameters are required.


### Creating `Migration` object

TBD


### Adding steps to the migration

TBD


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

TBD


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