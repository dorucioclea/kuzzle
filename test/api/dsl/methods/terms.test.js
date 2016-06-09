var
  should = require('should'),
  md5 = require('crypto-md5'),
  methods = require.main.require('lib/api/dsl/methods');

describe('Test terms method', function () {

  var
    roomIdMatch = 'roomIdMatch',
    roomIdNot = 'roomIdNotMatch',
    index = 'index',
    collection = 'collection',
    documentGrace = {
      firstName: 'Grace',
      lastName: 'Hopper'
    },
    documentAda = {
      firstName: 'Ada',
      lastName: 'Lovelace'
    },
    filter = {
      firstName: ['Grace', 'Jean']
    },
    termsfirstNameGraceJean = md5('termsfirstNameGrace,Jean'),
    nottermsfirstNameGraceJean = md5('nottermsfirstNameGrace,Jean'),
    encodedFirstName = md5('firstName');

  before(function () {
    methods.dsl.filtersTree = {};
    return methods.terms(roomIdMatch, index, collection, filter, false)
      .then(function() {
        return methods.terms(roomIdNot, index, collection, filter, true);
      });
  });

  it('should construct the filterTree object for the correct attribute', function () {
    should(methods.dsl.filtersTree).not.be.empty();
    should(methods.dsl.filtersTree[index]).not.be.empty();
    should(methods.dsl.filtersTree[index][collection]).not.be.empty();
    should(methods.dsl.filtersTree[index][collection].fields).not.be.empty();
    should(methods.dsl.filtersTree[index][collection].fields[encodedFirstName]).not.be.empty();
  });

  it('should construct the filterTree with correct curried function name', function () {
    should(methods.dsl.filtersTree[index][collection].fields[encodedFirstName][termsfirstNameGraceJean]).not.be.empty();
    should(methods.dsl.filtersTree[index][collection].fields[encodedFirstName][nottermsfirstNameGraceJean]).not.be.empty();
  });

  it('should construct the filterTree with correct room list', function () {
    var
      rooms = methods.dsl.filtersTree[index][collection].fields[encodedFirstName][termsfirstNameGraceJean].rooms,
      roomsNot = methods.dsl.filtersTree[index][collection].fields[encodedFirstName][nottermsfirstNameGraceJean].rooms;

    should(rooms).be.an.Array();
    should(roomsNot).be.an.Array();

    should(rooms).have.length(1);
    should(roomsNot).have.length(1);

    should(rooms[0]).be.exactly(roomIdMatch);
    should(roomsNot[0]).be.exactly(roomIdNot);
  });

  it('should construct the filterTree with correct functions terms', function () {
    var
      resultMatch = methods.dsl.filtersTree[index][collection].fields[encodedFirstName][termsfirstNameGraceJean].fn(documentGrace),
      resultNotMatch = methods.dsl.filtersTree[index][collection].fields[encodedFirstName][termsfirstNameGraceJean].fn(documentAda);

    should(resultMatch).be.exactly(true);
    should(resultNotMatch).be.exactly(false);

    resultMatch = methods.dsl.filtersTree[index][collection].fields[encodedFirstName][nottermsfirstNameGraceJean].fn(documentAda);
    resultNotMatch = methods.dsl.filtersTree[index][collection].fields[encodedFirstName][nottermsfirstNameGraceJean].fn(documentGrace);

    should(resultMatch).be.exactly(true);
    should(resultNotMatch).be.exactly(false);
  });

});