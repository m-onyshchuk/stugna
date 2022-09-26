'use strict';
const {Rule} = require('../rule');
const calculations = [
  {
    rule: "TRUE", result: true, facts: {}
  },
  {
    rule: "FALSE = FALSE", result: true, facts: {}
  },
  {
    rule: "TRUE <> FALSE", result: true, facts: {}
  },
  {
    rule: "TRUE = FALSE", result: false, facts: {}
  },
  {
    rule: "2 > 1", result: true, facts: {}
  },
  {
    rule: "2.0 > 1", result: true, facts: {}
  },
  {
    rule: "2.0 = 2", result: true, facts: {}
  },
  {
    rule: "'mouse' = 'mouse'", result: true, facts: {}
  },
  {
    rule: "'mouse' <> 'cat'", result: true, facts: {}
  },
  {
    rule: "'mouse' > 'cat'", result: true, facts: {}
  },
];

describe('rule calculation', () => {
  for (let item of calculations) {
    test(`condition: ${item.rule}`, () => {
      let rule = new Rule(item.rule, 'fact-name', 'fact-value', 10, 'description');
      let result = rule.check(item.facts);
      expect(result).toEqual(item.result);
    });
  }
})
