'use strict';
const {Rule} = require('../rule');
const {
  ERROR_RULE_STRING_NO_QUOTE,
  ERROR_RULE_PARENTHESES_1,
  ERROR_RULE_PARENTHESES_2
} = require('../errors-rule');
const parsing = [
  {
    rule: "'horse'",
    calc: "horse",
    error: null
  },
  {
    rule: "'horse",
    calc: "",
    error: ERROR_RULE_STRING_NO_QUOTE
  },
  {
    rule: "'white horse'",
    calc: "white horse",
    error: null
  },
  {
    rule: "(animal = 'monkey'",
    calc: "",
    error: ERROR_RULE_PARENTHESES_2
  },
  {
    rule: "animal = 'monkey')",
    calc: "",
    error: ERROR_RULE_PARENTHESES_1
  },
  {
    rule: "(animal = 'monkey')",
    calc: "animal monkey =",
    error: null
  },
  {
    rule: "((animal = 'monkey'))",
    calc: "animal monkey =",
    error: null
  },
  {
    rule: "(((animal = 'monkey')))",
    calc: "animal monkey =",
    error: null
  },
];

describe('rule parsing', () => {
    for (let item of parsing) {
      test(`condition: ${item.rule}`, () => {
        let rule = new Rule(item.rule, 'fact-name', 'fact-value', 10, 'description');
        expect(item.calc).toEqual(rule.getCalcString());
        expect(item.error).toEqual(rule.getError());
      });
    }
})
