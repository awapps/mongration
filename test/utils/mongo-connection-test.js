var expect = require('chai').expect;

describe('utils/mongo-connection', function () {
    var MongoConn = require('../../src/utils/mongo-connection');

    describe('MongoConnection', function () {
        describe('#constructor(opts)', function () {
            it('requires opts.mongoUri or opts.hosts', function () {
                expect(function () {
                    new MongoConn()
                }).to.throw(Error);
                expect(function () {
                    new MongoConn({})
                }).to.throw(Error);
                expect(function () {
                    new MongoConn({mongoUri: 'urlii'})
                }).not.to.throw(Error);
                expect(function () {
                    new MongoConn({hosts: 'host'})
                }).not.to.throw(Error);
            });
            it('has additional opts: db, user, password, replicaSet', function () {
                var connUtil = new MongoConn({
                    hosts: '1', db:'2', user: '3',
                    password:'4', replicaSet: '5'
                });

                expect(connUtil).to.have.property('hosts', '1')
                expect(connUtil).to.have.property('db','2')
                expect(connUtil).to.have.property('user','3')
                expect(connUtil).to.have.property('password','4')
                expect(connUtil).to.have.property('replicaSet','5')
            });
        })

        describe('#getConnectionUri()', function () {
            xit('pass thru mongoUri if given', function () {
                // FIXME: currently it returns mongodb://undefined/
                var uri = new MongoConn({mongoUri: 'url'}).getConnectionUri();
                expect(uri).to.equal('url');
            });
            it('builds connectionUri from opts', function () {

                expect(new MongoConn({
                        hosts: '1'
                    }).getConnectionUri())
                    .to.equal('mongodb://1/');

                expect(new MongoConn({
                        hosts: '1', db:'2', user: '3',
                        password:'4'
                    }).getConnectionUri())
                    .to.equal('mongodb://3:4@1/2')

                expect(new MongoConn({
                        hosts: '1', db:'2', user: '3',
                        password:'4', replicaSet: '5'
                    }).getConnectionUri())
                    .to.equal('mongodb://3:4@1/2?replicaSet=5')

            })
        })

    })
})
