/*!
 *
 * Copyright (c) 2013 Sebastian Golasch
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

'use strict';

// ext. libs
var Q = require('q');
var uuid = require('node-uuid');
var chai = require('chai');

// Module variable
var Assertions;

/**
 * @module Assertions
 * @namespace Dalek.Internal
 */

module.exports = function () {
  return Assertions;
};

/**
 * Assertions check if the assumptions you made about a website are correct.
 * Assetions might check if the title of a page is as expected,
 * if an element has the expected text,
 * if your mobile website version only displays a certian amount of elements
 * and many more...
 *
 * @class Assertions
 * @constructor
 * @part Assertions
 * @api
 */

Assertions = function (opts) {
  this.test = opts.test;
  this.proceeded = [];
  this.chaining = false;
};

/**
 * It can be really cumbersome to always write assert, assert & assert
 * all over the place when your doing multiple assertions.
 * To avoid this you can open an assertion context in your test that
 * allows you to write n assetions, but can avoid to type asset before each.
 *
 * So, instead of writing this:
 *
 * ```javascript
 * test.open('http://doctorwhotv.co.uk/')
 *     .assert.text('#nav').is('Navigation')
 *     .assert.visible('#nav')
 *     .assert.attr('#nav', 'data-nav', 'true')
 *     .done();
 * ```
 *
 * you can write this:
 *
 * ```javascript
 * test.open('http://doctorwhotv.co.uk/')
 *     .assert.chain()
 *       .text('#nav').is('Navigation')
 *       .visible('#nav')
 *       .attr('#nav', 'data-nav', 'true')
 *     .end()
 *     .done();
 * ```
 *
 * to make it even more concise, you can combine this with the [query](actions.html#meth-query) method:
 *
 * ```javascript
 * test.open('http://doctorwhotv.co.uk/')
 *     .assert.chain()
 *       .query('#nav')
 *           .text().is('Navigation')
 *           .visible()
 *           .attr('data-nav', 'true')
 *         .end()
 *     .end()
 *     .done();
 * ```
 *
 * Always make sure, you terminate it with the [end](#meth-end) method!
 *
 * @api
 * @method chain
 * @chainable
 */

Assertions.prototype.chain = function () {
  this.test.lastChain.push('chaining');
  this.chaining = true;
  return this;
};

/**
 * Terminates an assertion chain or a query
 *
 * ```javascript
 * test.open('http://doctorwhotv.co.uk/')
 *     .assert.chain()
 *       .query('#nav')
 *           .text().is('Navigation')
 *           .visible()
 *           .attr('data-nav', 'true')
 *         .end()
 *     .end()
 *     .done();
 * ```
 *
 * @api
 * @method end
 * @chainable
 */

Assertions.prototype.end = function () {
  var lastAction = this.test.lastChain.pop();
  if (lastAction === 'chaining') {
    this.chaining = false;
  }

  if (lastAction  === 'querying') {
    this.test.querying = false;
  }
  return this.test;
};

/**
 * Asserts that a given ressource does exist in the environment.
 *
 * @method resourceExists
 * @param {string} url URL of the resource to check
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.resourceExists = function (url, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('resourceExists', 'resourceExists', this._testTruthy, hash, {url: url, message: message}).bind(this.test);
  this._addToActionQueue([url, hash], 'resourceExists', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that a given element appears n times on the page.
 *
 *
 * Given this portion of html, you would like to assure that all of these elements
 * are ending up in your rendered markup on your page.
 *
 * ```html
 * <section id="blog-overview">
 *   <article class="teaser"></article>
 *   <article class="teaser"></article>
 *   <article class="teaser"></article>
 *   <article class="teaser"></article>
 * </section>
 * ```
 *
 * The simple solution is to check if all these elements are present
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser', 4, '4 blog teasers are present')
 * ```
 * The alternate syntax for this is:
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is(4, '4 blog teasers are present')
 * ```
 *
 * If you are not sure how many elements will exactly end up in your markup,
 * you could use the between assertion handler
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is.between([2, 6], 'Between 2 and 6 blog teasers are present')
 * ```
 *
 * If you dealing with the situation that you have a minimum of elements,
 * you expect, you can use this helper...
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is.gt(2, 'At least 3 blog teasers are present')
 * ```
 * ... if you want to know if its 'greater than equal', you can use this one...
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is.gte(2, 'At least 2 blog teasers are present')
 * ```
 * ... as well as their 'lower than' and 'lower than equal' equivalents
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is.lt(5, 'Less than 5 blog teasers are present')
 * ```
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is.lte(5, 'Less than, or 5 blog teasers are present')
 * ```
 * And if you just wan't to know, if a certain amount of teasers isn't present,
 * you can still use the not() assertion helper
 *
 * ```javascript
 * test.assert.numberOfElements('#blog-overview .teaser')
 *     .is.not(5, 'There are more or less than 5 teasers present')
 * ```
 *
 * @api
 * @method numberOfElements
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected test result
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.numberOfElements = function (selector, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('numberOfElements', 'numberOfElements', this._testShallowEquals, hash, {expected: expected, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'getNumberOfElements', cb);
  return this.chaining ? this : this.test;
};

/**
 *
 * Asserts that a given element is visible n times in the current viewport.
 *
 *
 * Given this portion of html, you would like to assure that all of these elements
 * are ending up in your rendered markup on your page.
 *
 * ```html
 * <section id="blog-overview">
 *   <article class="teaser"></article>
 *   <article class="teaser"></article>
 *   <article class="teaser"></article>
 *   <article class="teaser"></article>
 * </section>
 * ```
 *
 * The simple solution is to check if all these elements are visible
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser', 4, '4 blog teasers are visible')
 * ```
 * The alternate syntax for this is:
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is(4, '4 blog teasers are visible')
 * ```
 *
 * If you are not sure how many elements will exactly be shown in the current viewport,
 * you could use the between assertion handler
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is.between(2, 6, 'Between 2 and 6 blog teasers are visible')
 * ```
 *
 * If you dealing with the situation that you have a minimum of elements,
 * you expect, you can use this helper...
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is.gt(2, 'At least 3 blog teasers are visible')
 * ```
 * ... if you want to know if its 'greater than equal', you can use this one...
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is.gte(2, 'At least 2 blog teasers are visible')
 * ```
 * ... as well as their 'lower than' and 'lower than equal' equivalents
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is.lt(5, 'Less than 5 blog teasers are visible')
 * ```
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is.lte(5, 'Less than, or 5 blog teasers are visible')
 * ```
 * And if you just wan't to know, if a certain amount of teasers isn't visible,
 * you can still use the ':not(): assertion helper
 *
 * ```javascript
 * test.assert.numberOfVisibleElements('#blog-overview .teaser')
 *     .is.not(5, 'There are more or less than 5 teasers visible')
 * ```
 *
 * @api
 * @method numberOfVisibleElements
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected test result
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.numberOfVisibleElements = function (selector, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('numberOfVisibleElements', 'numberOfVisibleElements', this._testShallowEquals, hash, {expected: expected, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'getNumberOfVisibleElements', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that a given form field has the provided value.
 *
 * Given this portion of html, we would like to get the information which option element
 * is currently selected.
 *
 * ```html
 * <form name="fav-doctor" id="fav-doctor">
 *   <select id="the-doctors">
 *     <option value="9">Eccleston</option>
 *     <option selected value="10">Tennant</option>
 *     <option value="11">Smith</option>
 *   </select>
 * </form>
 * ```
 *
 * ```javascript
 * test
 *   .assert.val('#the-doctors', 10, 'David is the favourite')
 *   // lets change the favourite by selection the last option
 *  .click('#the-doctors option:last')
 *  .assert.val('#the-doctors', 11, 'Matt is now my favourite, bow ties are cool')
 * ```
 *
 * This assertion is capable of getting the values from every form element
 * that holds a value attribute
 *
 * Getting texts out of normal input fields is pretty straight forward
 *
 * ```html
 * <label for="fav-enemy">Tell my your favourity Who enemy:</label>
 * <input id="fav-enemy" name="fav-enemy" type="text" value="Daleks" />
 * ```
 *
 * ```javascript
 * test
 *   .assert.val('#fav-enemy', 'Daleks', 'Daleks are so cute')
 *   // lets change the favourite by typing smth. new
 *  .type('#fav-enemy', 'Cyberman')
 *  .assert.val('#fav-enemy', 'Cyberman', 'Cyberman are so cyber')
 * ```
 *
 * @api
 * @method val
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected test result
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.val = function (selector, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('val', 'val', this._testShallowEquals, hash, {expected: expected, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'val', cb);
  return this.chaining ? this : this.test;
};

/**
 * Checks the computed style.
 *
 * ```html
 * <div id="superColoredElement">Rose</div>
 * ```
 *
 * ```css
 * #superColoredElement {
 *   background-color: rgba(255, 0, 0, 1);
 *   color: rgba(0, 128, 0, 1);
 * }
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://unicorns.rainbows.io')
 *    .assert.css('#superColoredElement', 'background-color', 'rgba(255, 0, 0, 1)')
 *    .assert.css('#superColoredElement', 'color', 'rgba(0, 128, 0, 1)')
 *    .done();
 * ```
 *
 * @api
 * @method css
 * @param {string} selector Selector that matches the elements to test
 * @param {string} property CSS property to check
 * @param {string} expected Expected test result
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.css = function (selector, property, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = property;
    property = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('css', 'css', this._testShallowEquals, hash, {expected: expected, selector: selector, porperty: property, message: message}).bind(this.test);
  this._addToActionQueue([selector, property, expected, hash], 'css', cb);
  return this.chaining ? this : this.test;
};

/**
 * Checks the actual width of an element.
 *
 * ```html
 *   <div id="fixed-dimensions" style="width: 100px"></div>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://localhost:5000/index.html')
 *    // all true, all pixel
 *    .assert.width('#fixed-dimensions', 100)
 *    .assert.width('#fixed-dimensions').is(100)
 *    .assert.width('#fixed-dimensions').is.not(100)
 *    .assert.width('#fixed-dimensions').is.gt(90)
 *    .assert.width('#fixed-dimensions').is.gte(97)
 *    .assert.width('#fixed-dimensions').is.lt(120)
 *    .assert.width('#fixed-dimensions').is.lte(110)
 *    .assert.width('#fixed-dimensions').is.between([90, 110])
 *    .done();
 *
 * ```
 *
 * @api
 * @method width
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected test result
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.width = function (selector, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('width', 'width', this._testShallowEquals, hash, {expected: expected, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'width', cb);
  return this.chaining ? this : this.test;
};

/**
 * Checks the actual height of an element.
 *
 * ```html
 *   <div id="fixed-dimensions" style="height: 100px"></div>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://localhost:5000/index.html')
 *    // all true, all pixel
 *    .assert.height('#fixed-dimensions', 100)
 *    .assert.height('#fixed-dimensions').is(100)
 *    .assert.height('#fixed-dimensions').is.not(100)
 *    .assert.height('#fixed-dimensions').is.gt(90)
 *    .assert.height('#fixed-dimensions').is.gte(97)
 *    .assert.height('#fixed-dimensions').is.lt(120)
 *    .assert.height('#fixed-dimensions').is.lte(110)
 *    .assert.height('#fixed-dimensions').is.between([90, 110])
 *    .done();
 *
 * ```
 *
 * @api
 * @method height
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected test result
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.height = function (selector, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('height', 'height', this._testShallowEquals, hash, {expected: expected, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'height', cb);
  return this.chaining ? this : this.test;
};

/**
 * Determine if an <option> element, or an <input> element of type checkbox or radio is currently selected.
 *
 * ```html
 * <input type="checkbox" id="unchecked_checkbox" name="unchecked_checkbox"/>
 * <input type="checkbox" id="checked_checkbox" name="checked_checkbox" checked="checked"/>
 * <select id="select_elm" name="select_elm">
 *   <option value="9">Eccleston</option>
 *   <option selected value="10">Tennant</option>
 *   <option value="11">Smith</option>
 * </select>
 * ```
 *
 * Checking radio and checkboxes:
 *
 * ```javascript
 *  test
 *    .open('http://selectables.org')
 *    .assert.selected('#checked_checkbox')
 *    .done();
 * ```
 *
 * Checking option elements:
 *
 * ```javascript
 *  test
 *    .open('http://selectables.org')
 *    .assert.selected('#select_elm option:nth-child(2)')
 *    .done();
 * ```
 *
 * @api
 * @method selected
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.selected = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('selected', 'selected', this._testShallowEquals, hash, {expected: true, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, true, hash], 'selected', cb);
  return this.chaining ? this : this.test;
};

/**
 * Determine if an <option> element, or an <input> element of type checkbox or radio is currently not selected.
 *
 * ```html
 * <input type="checkbox" id="unchecked_checkbox" name="unchecked_checkbox"/>
 * <input type="checkbox" id="checked_checkbox" name="checked_checkbox" checked="checked"/>
 * <select id="select_elm" name="select_elm">
 *   <option value="9">Eccleston</option>
 *   <option selected value="10">Tennant</option>
 *   <option value="11">Smith</option>
 * </select>
 * ```
 *
 * Checking radio and checkboxes:
 *
 * ```javascript
 *  test
 *    .open('http://selectables.org')
 *    .assert.notSelected('#unchecked_checkbox')
 *    .done();
 * ```
 *
 * Checking option elements:
 *
 * ```javascript
 *  test
 *    .open('http://selectables.org')
 *    .assert.notSelected('#select_elm option:last-child')
 *    .done();
 * ```
 *
 * @api
 * @method notSelected
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.notSelected = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('selected', 'selected', this._testShallowEquals, hash, {expected: false, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, false, hash], 'selected', cb);
  return this.chaining ? this : this.test;
};

/**
 * Determine if an element is currently enabled.
 *
 * ```html
 * <input id="onmars" type="text" size="50" name="onmars" placeholder="State your name, rank and intention!"></input>
 * ```
 *
 * ```javascript
 * test
 *   .open('http://doctor.thedoctor.com/doctor')
 *   .assert.enabled('#onmars', 'Is enabled!')
 *   .done();
 * ```
 *
 * @api
 * @method enabled
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.enabled = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('enabled', 'enabled', this._testShallowEquals, hash, {expected: true, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, true, hash], 'enabled', cb);
  return this.chaining ? this : this.test;
};

/**
 * Determine if an element is currently disabled.
 *
 * ```html
 * <input disabled id="onearth" type="text" size="50" name="onearth" placeholder="State your name, rank and intention!"></input>
 * ```
 *
 * ```javascript
 * test
 *   .open('http://doctor.thedoctor.com/doctor')
 *   .assert.disabled('#onearth', 'Is disabled!')
 *   .done();
 * ```
 *
 * @api
 * @method disabled
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.disabled = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('enabled', 'enabled', this._testShallowEquals, hash, {expected: false, selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, false, hash], 'enabled', cb);
  return this.chaining ? this : this.test;
};

/**
 * Checks the contents of a cookie.
 *
 * ```javascript
 *  test
 *    .open('http://cookiejar.io/not_your_mothers_javascript.html')
 *    .setCookie('atestcookie', 'foobar=baz')
 *    .assert.cookie('atestcookie', 'foobar=baz')
 *    .done();
 * ```
 *
 * @api
 * @method cookie
 * @param {string} name Name of the cookie
 * @param {string} expect Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.cookie = function (name, expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('cookie', 'cookie', this._testShallowEquals, hash, {expected: expected, name: name, message: message}).bind(this.test);
  this._addToActionQueue([name, expected, hash], 'cookie', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that current HTTP status code is the same as the one passed as argument.
 * TODO: Needs some work to be implement (maybe JavaScript, Webdriver ha no method for this)
 *
 * @method httpStatus
 * @param {integer} status HTTP status code
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.httpStatus = function (status, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('httpStatus', 'httpStatus', this._testShallowEquals, hash, {expected: status, message: message}).bind(this.test);
  this._addToActionQueue([status, hash], 'httpStatus', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that an element matching the provided selector expression exists in remote DOM environment.
 *
 * ```html
 * <body>
 *   <p id="so-lonely">Last of the timelords</p>
 * </body>
 * ```
 *
 * ```javascript
 * test
 *   .open('http://doctor.thedoctor.com/doctor')
 *   .assert.exists('#so-lonely', 'The loneliest element in the universe exists')
 *   .done()
 * ```
 *
 * @api
 * @method exists
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.exists = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('exists', 'exists', this._testTruthy, hash, {selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, hash], 'exists', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that an element matching the provided selector expression doesn't exists within the remote DOM environment.
 *
 * ```html
 * <body>
 *   <p id="so-lonely">Last of the timelords</p>
 * </body>
 * ```
 *
 * ```javascript
 * test
 *   .open('http://doctor.thedoctor.com/doctor')
 *   .assert.doesntExist('#the-master', 'The master element has not been seen')
 *   .done();
 * ```
 *
 * @api
 * @method doesntExist
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.doesntExist = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('exists', '!exists', this._testFalsy, hash, {selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, hash], 'exists', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that the element matching the provided selector expression is not visible.
 *
 * ```html
 * <body>
 *   <h1 style="display: none">Me? So hidden...</h1>
 *   <h2>Me? So in viewport...</h2>
 * </body>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://allyourviewportsbelongto.us')
 *    .assert.notVisible('h1', 'Element is not visible')
 *    .done();
 * ```
 *
 * @api
 * @method notVisible
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.notVisible = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('visible', '!visible', this._testFalsy, hash, {selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, hash], 'visible', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that the element matching the provided selector expression is visible.
 *
 * ```html
 * <body>
 *   <h1>Me? So in viewport...</h1>
 * </body>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://allyourviewportsbelongto.us')
 *    .assert.visible('h1', 'Element is visible')
 *    .done();
 * ```
 *
 * @api
 * @method visible
 * @param {string} selector Selector that matches the elements to test
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.visible = function (selector, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('visible', 'visible', this._testTruthy, hash, {selector: selector, message: message}).bind(this.test);
  this._addToActionQueue([selector, hash], 'visible', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that given text does not exist in the provided selector.
 *
 * ```html
 * <body>
 *   <h1>This is a casperjs sandbox</h1>
 * </body>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.doesntHaveText('h1', 'This page is a Dalek sandbox', 'It´s a sandbox!')
 *    .done();
 * ```
 *
 * @api
 * @method doesntHaveText
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.doesntHaveText = function (selector, expected, message) {
  var hash = uuid.v4();
  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('text', '!text', this._testShallowUnequals, hash, {selector: selector, expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'text', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that given text does not exist in the current alert/prompt/confirm dialog.
 *
 * ```html
 * <a href="#" id="alert_confirm" onclick="confirm('Confirm me!')">I make confirm</a>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://skaaro.com/index.html')
 *    .click('#alert_confirm')
 *    .assert.dialogDoesntHaveText('I am an alert')
 *    .accept()
 *    .done();
 * ```
 *
 * @api
 * @method dialogDoesntHaveText
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.dialogDoesntHaveText = function (expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('alertText', '!alertText', this._testShallowUnequals, hash, {expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([expected, hash], 'alertText', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that given text does exist in the provided selector.
 *
 * ```html
 * <body>
 *   <h1>This is a Dalek sandbox</h1>
 * </body>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.text('h1', 'This page is a Dalek sandbox', 'Exterminate!')
 *    .done();
 * ```
 *
 * of course, text works also with the assertion helpers is() and not()
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.text('h1').is('This page is a Dalek sandbox', 'Exterminate!')
 *    .done();
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.text('h1').is.not('This page is a CasperJS sandbox', 'Exterminate!')
 *    .done();
 * ```
 *
 * @api
 * @method text
 * @param {string} selector Selector that matches the elements to test
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.text = function (selector, expected, message) {
  var hash = uuid.v4();
  if (this.test.querying === true) {
    message = expected;
    expected = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('text', 'text', this._testShallowEquals, hash, {selector: selector, expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([selector, expected, hash], 'text', cb);
  return (this.chaining || this.test.querying) ? this : this.test;
};

/**
 * Asserts that given alertText does exist in the provided alert/confirm or prompt dialog.
 *
 * ```html
 * <a href="#" id="alert" onclick="alert('I am an alert')">I make alerts!</a>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://skaaro.com/index.html')
 *    .click('#alert_confirm')
 *    .assert.dialogText('I am an alert')
 *    .accept()
 *    .done();
 * ```
 *
 * of course, text works also with the assertion helpers is() and not()
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.dialogText().is('I am an alert', 'Exterminate!')
 *    .done();
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.dialogText().is.not('I am an prompt', 'Exterminate!')
 *    .done();
 * ```
 *
 * @api
 * @method dialogText
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.dialogText = function (expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('alertText', 'alertText', this._testShallowEquals, hash, {expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([expected, hash], 'alertText', cb);
  return (this.chaining || this.test.querying) ? this : this.test;
};

/**
 * Asserts that the page title is as expected.
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.title('Doctor Who TV', 'Not your daleks tv')
 *     .done();
 * ```
 *
 * Yep, using assertion helpers is also possible:
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.title().is('Doctor Who TV', 'Not your daleks tv')
 *     .done();
 * ```
 *
 * and the not() helper is available too:
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.title().is.not('Dalek Emperor TV', 'Not your daleks tv')
 *     .done();
 * ```
 *
 * @api
 * @method title
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.title = function (expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('title', 'title', this._testShallowEquals, hash, {expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([expected, hash], 'title', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that given title does not match the given expactions
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.doesntHaveTitle('Dalek Emperor TV', 'Not your daleks tv')
 *     .done();
 * ```
 *
 * @api
 * @method title
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.doesntHaveTitle = function (expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('title', '!title', this._testShallowUnequals, hash, {expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([expected, hash], 'title', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that the pages url is as expected.
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.url('http://doctorwhotv.co.uk/', 'Url is as expected')
 *     .done();
 * ```
 *
 * You can also check if the protocol changend,
 * nice to see when you open github with http instead of https
 *
 * ```javascript
 *   test.open('http://github.com')
 *     .assert.url('https://github.com/', 'Changed prototcols')
 *     .done();
 * ```
 *
 * Yep, using assertion helpersx is also possible:
 *
 * ```javascript
 *   test.open('http://github.com')
 *     .assert.url().is('http://doctorwhotv.co.uk/', 'Url is as expected')
 *     .done();
 * ```
 *
 * and the not() helper is available too:
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.url().is.not('http://doctorwhotv.co.uk/', 'Url is as expected')
 *     .done();
 * ```
 *
 * @api
 * @method url
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.url = function (expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('url', 'url', this._testShallowEquals, hash, {expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([expected, hash], 'url', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that the pages url does not match the expectation.
 *
 * ```javascript
 *   test.open('http://doctorwhotv.co.uk/')
 *     .assert.doesntHaveUrl('http://doctorwhotv.co.uk/', 'Url is not expected')
 *     .done();
 * ```
 *
 * @api
 * @method doesntHaveUrl
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.doesntHaveUrl = function (expected, message) {
  var hash = uuid.v4();
  var cb = this._generateCallbackAssertion('url', '!url', this._testShallowUnequals, hash, {expected: expected, message: message}).bind(this.test);
  this._addToActionQueue([expected, hash], 'url', cb);
  return this.chaining ? this : this.test;
};

/**
 * Asserts that an elements attribute is as expected.
 *
 * ```html
 * <form>
 *   <button class="jumpButton" type="submit">Fire</button>
 * </form>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.attr('.jumpButton', 'type', 'submit')
 *    .done();
 * ```
 *
 * ```html
 * <div id="dataDiv" data-spot="cat"></div>
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.attr('#dataDiv').is('data-spot', 'cat', 'We found Datas cat!')
 *    .done();
 * ```
 *
 * ```javascript
 *  test
 *    .open('http://dalekjs.com/guineapig/')
 *    .assert.attr('#dataDiv').is.not('data-spot', 'doc', 'Spot is not a dog!')
 *    .done();
 * ```
 *
 * @api
 * @method attr
 * @param {string} selector Selector that matches the elements to test
 * @param {string} attribute The attribute to test
 * @param {string} expected Expected testresult
 * @param {string} message Message for the test reporter
 * @chainable
 */

Assertions.prototype.attr = function (selector, attribute, expected, message) {
  var hash = uuid.v4();

  if (this.test.querying === true) {
    message = expected;
    expected = attribute;
    attribute = selector;
    selector = this.test.selector;
  }

  var cb = this._generateCallbackAssertion('attribute', 'attribute', this._testShallowEquals, hash, {expected: expected, message: message, selector: selector, attribute: attribute}).bind(this.test);
  this._addToActionQueue([selector, attribute, expected, hash], 'attribute', cb);
  return this.chaining ? this : this.test;
};

// TEST HELPER
// -----------

/**
 * Is helper
 *
 * @method is
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.is = function (expected, message) {
  return this.generateTestHelper('is', '_testShallowEquals', false)(expected, message);
};

/**
 * Not helper
 *
 * @method not
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.not = function (expected, message) {
  return this.generateTestHelper('not', '_testShallowEquals', true)(expected, message);
};

/**
 * Between helper
 *
 * @method between
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.between = function (expected, message) {
  return this.generateTestHelper('between', '_testBetween', false)(expected, message);
};

/**
 * Gt helper
 *
 * @method gt
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.gt = function (expected, message) {
  return this.generateTestHelper('gt', '_testGreaterThan', false)(expected, message);
};

/**
 * Gte helper
 *
 * @method gte
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.gte = function (expected, message) {
  return this.generateTestHelper('gte', '_testGreaterThanEqual', false)(expected, message);
};

/**
 * Lt helper
 *
 * @method lt
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.lt = function (expected, message) {
  return this.generateTestHelper('lt', '_testLowerThan', false)(expected, message);
};

/**
 * Lte helper
 *
 * @method lte
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.lte = function (expected, message) {
  return this.generateTestHelper('lte', '_testLowerThanEqual', false)(expected, message);
};

/**
 * Contain helper
 *
 * @method contain
 * @param {mixed} expected Value to check
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.contain = function (expected, message) {
  return this.generateTestHelper('contain', '_contain', false)(expected, message);
};

/**
 * Match helper
 *
 * @method match
 * @param {string} expected Regex to match on
 * @param {string} message Test message
 * @chainable
 */

Assertions.prototype.match = function (expected, message) {
  return this.generateTestHelper('match', '_match', false)(expected, message);
};

// HELPER METHODS
// --------------

/**
 * Generates a callback that will be fired when the action has been completed.
 * The callback itself will then validate the answer and will also emit an event
 * that the action has been successfully executed.
 *
 * @method _generateCallbackAssertion
 * @param {string} key Unique key of the action
 * @param {string} type Type of the action (normalle the actions name)
 * @return {function} The generated callback function
 * @private
 */

Assertions.prototype._generateCallbackAssertion = function (key, type, test, hash, opts) {
  var cb = function (data) {
    if (data && data.key === key && data.hash === hash) {

      this._lastGeneratedAction = {key: key, type: type, test: test, hash: hash, opts: opts, data: data};

      if (!opts.expected && (key === 'title' || key === 'width' || key === 'height' || key === 'url' || key === 'text' || key === 'attribute' || key === 'numberOfElements' || key === 'numberOfVisibleElements')) {
        return false;
      }

      var testResult = test(data.value, opts.expected);

      this.reporter.emit('report:assertion', {
        success: testResult,
        expected: opts.expected,
        value: data.value,
        message: opts.message,
        type: type
      });

      this.incrementExpectations();
      if (!testResult) {
        this.incrementFailedAssertions();
      }
    }
  };
  return cb;
};

/**
 * Adds a method to the queue of actions/assertions to execute
 *
 * @method _addToActionQueue
 * @param {object} opts Options of the action to invoke
 * @param {string} driverMethod Name of the method to call on the driver
 * @param {function} A callback function that will be executed when the action has been executed
 * @private
 * @chainable
 */

Assertions.prototype._addToActionQueue = function (opts, driverMethod, cb) {
  this._lastGeneratedShit = {opts: opts, driverMethod: driverMethod};
  this.test.actionPromiseQueue.push(function () {
    var deferredAction = Q.defer();
    this.test.driver[driverMethod].apply(this.test.driver, opts);
    deferredAction.resolve();
    this.test.driver.events.on('driver:message', cb);
    return deferredAction.promise;
  }.bind(this));
  return this;
};

/**
 * Generates a function that can be used
 *
 * @method generateTestHelper
 * @param name
 * @param assertionFn
 * @param negate
 * @return
 * @private
 */

Assertions.prototype.generateTestHelper = function (name, assertionFn, negate) {
  return function (expected, message) {
    var gen = this._lastGeneratedShit;

    this.test.actionPromiseQueue.push(function () {
      var deferredAction = Q.defer();
      deferredAction.resolve();
      this.test.driver.events.on('driver:message', function () {

        if (gen.opts && gen.opts[(gen.opts.length - 1)] && this.test._lastGeneratedAction && this.test._lastGeneratedAction.hash) {
          if (gen.opts[(gen.opts.length - 1)] === this.test._lastGeneratedAction.hash && !this.proceeded[this.test._lastGeneratedAction.hash + name]) {
            var testResult = this[assertionFn](expected, this.test._lastGeneratedAction.data.value);

            if (negate) {
              testResult = !testResult;
            }

            this.proceeded[this.test._lastGeneratedAction.hash + name] = true;

            this.test.reporter.emit('report:assertion', {
              success: testResult,
              expected: expected,
              value: this.test._lastGeneratedAction.data.value,
              message: message,
              type: this.test._lastGeneratedAction.type
            });

            this.test.incrementExpectations();

            if (!testResult) {
              this.test.incrementFailedAssertions();
            }
          }
        }
      }.bind(this));
      return deferredAction.promise;
    }.bind(this));

    return this.chaining ? this : this.test;
  }.bind(this);
};

// ASSERT METHODS
// --------------

/**
 * Assert if a given value shallow equals a snd. given value
 *
 * @method _testShallowEquals
 * @param {mixed} a Value to test
 * @param {mixed} b Value to test
 * @return {bool} false if values don't match, true if they match
 * @private
 */

Assertions.prototype._testShallowEquals = function (a, b) {
  try {
    chai.assert.equal(a, b);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Assert if a given value shallow does not equal a snd. given value
 *
 * @method _testShallowUnequals
 * @param {mixed} a Value to test
 * @param {mixed} b Value to test
 * @return {bool} true if values don't match, false if they match
 * @private
 */

Assertions.prototype._testShallowUnequals = function (a, b) {
  try {
    chai.assert.notEqual(a, b);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Assert if a given value matches a range
 *
 * @method _testBetween
 * @param {array} a Range to test
 * @param {bool} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._testBetween = function (a, b) {
  try {
    chai.expect(b).to.be.within(a[0], a[1]);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Assert if a given value is greater than the value to compare
 *
 * @method _testGreaterThan
 * @param {bool} a Value to test
 * @param {bool} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._testGreaterThan = function (a, b) {
  try {
    chai.expect(b).to.be.above(a);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Assert if a given value is greater or equal than the value to compare
 *
 * @method _testGreaterThanEqual
 * @param {bool} a Value to test
 * @param {bool} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._testGreaterThanEqual = function (a, b) {
  return this._testGreaterThan(a - 1, b);
};

/**
 * Assert if a given value is lower than the value to compare
 *
 * @method _testLowerThan
 * @param {bool} a Value to test
 * @param {bool} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._testLowerThan = function (a, b) {
  try {
    chai.expect(b).to.be.below(a);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Assert if a given value contain another value
 *
 * @method _contain
 * @param {bool} a Value to test
 * @param {bool} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._contain = function (a, b) {
  try {
    chai.expect(b).to.include(a);
  } catch (e) {
    return false;
  }

  return true;
};

/**
 * Assert if a given value is lower or equal than the value to compare
 *
 * @method _testLowerThanEqual
 * @param {bool} a Value to test
 * @param {bool} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._testLowerThanEqual = function (a, b) {
  return this._testLowerThan(a + 1, b);
};

/**
 * Assert if a given value is boolean 'true'
 *
 * @method _testTruthy
 * @param {bool} a Value to test
 * @return {bool} false if value is false, true if value is true
 * @private
 */

Assertions.prototype._testTruthy = function (a) {
  return a === 'true' || a === true;
};

/**
 * Assert if a given value is boolean 'false'
 *
 * @method _testFalsy
 * @param {bool} a Value to test
 * @return {bool} true if value is false, false if value is true
 * @private
 */

Assertions.prototype._testFalsy = function (a) {
  return a === 'false' || a === false;
};

/**
 * Assert a given value matches a regex
 *
 * @method _contain
 * @param {mixed} a Value to test
 * @param {string} b Value to compare
 * @return {bool} testresult
 * @private
 */

Assertions.prototype._match = function (a, b) {
  try {
    chai.expect(b).to.match(a);
  } catch (e) {
    return false;
  }

  return true;
};
