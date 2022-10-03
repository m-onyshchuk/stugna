'use strict';
const {Fact} = require('../fact');
describe('Facts', () => {

  test(`Boolean true`, () => {
    let fact = new Fact('fact-name', 'TRUE', 'fact-description');
    expect(fact.value).toEqual(true);
  });

  test(`Boolean false`, () => {
    let fact = new Fact('fact-name', 'FALSE', 'fact-description');
    expect(fact.value).toEqual(false);
  });

  test(`Empty description`, () => {
    let fact = new Fact('fact-name', 'fact-value');
    expect(fact.history.length).toBeGreaterThan(0);
    expect(fact.history[0]).not.toBeNull();
  });

})
