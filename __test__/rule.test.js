'use strict';
const {Rule} = require('../rule');
const validations = require('./rule-validations');
const conditions = require('./rule-conditions');

describe('rule validation', () => {
  for (let item of validations) {
    test(`validation: __${item.error}__`, () => {
      let rule = new Rule(item.condition, item.factName, item.factValue, item.priority, item.description);
      expect(rule.getError()).toEqual(item.error);
    });
  }
})

describe('rule conditions', () => {
    for (let item of conditions) {
      test(`condition: __${item.rule}__`, () => {
        let rule = new Rule(item.rule, 'fact-name', 'fact-value', 10, 'description');
        expect(rule.getCalcString()).toEqual(item.calc);
        expect(rule.getError()).toEqual(item.error);
      });
    }
})

// TODO test for rule calc
