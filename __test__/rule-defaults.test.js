'use strict';
const {Rule} = require('../rule');

describe('Rule default fields', () => {

  test(`use default values`, () => {
    let rule = new Rule('1=1', 'a', 'b');
    expect(rule.priority).toEqual(1);
    expect(rule.description.length).toBeGreaterThan(0);
    expect(rule.factElse).toBeNull();
    expect(rule.valueElse).toBeNull();
  });

  test(`not use default values`, () => {
    const priority = 2;
    const description = 'description';
    const factNameElse = 'factNameElse';
    const factValueElse = 'factValueElse';
    let rule = new Rule('1=1', 'a', 'b', priority, description, factNameElse, factValueElse);
    expect(rule.priority).toEqual(priority);
    expect(rule.description).toEqual(description);
    expect(rule.factElse).toEqual(factNameElse);
    expect(rule.valueElse).toEqual(factValueElse);
  });
})
