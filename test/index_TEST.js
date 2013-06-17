'use strict';

var expect = require('chai').expect;
var Assertions = require('../index.js');

describe('dalek-internal-assertions', function() {

  it('should exist', function() {
    var assertions = new Assertions();
    expect(assertions).to.be.ok;
  });

});
