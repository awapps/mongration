var expect = require('chai').expect;

describe('utils/utility-functions', function () {
    var utilities = require('../../../src/utils/utility-functions');
    describe('#arrayToObject(array<Object>, objectIdentifier)', function () {
        it('converts array to lookup object', function () {
            var input = [{id:1}, null];
            var result = utilities.arrayToObject(input, 'id');
            expect(result).to.deep.equal({1: {id:1}});
        })
    })
})
