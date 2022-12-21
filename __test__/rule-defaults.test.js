'use strict';
const {Rule} = require('../rule');

describe('Rule default fields', () => {

  test(`priority & description`, () => {
    let rule = new Rule('1=1', 'a', 'b');
    expect(rule.priority).toEqual(1);
    expect(rule.description.length).toBeGreaterThan(0);
  });
})
