'use strict';
const {Rule} = require('../rule');

const validations = [
  {
    condition: "",
    factName: "***",
    factValue: "***",
    priority: "***",
    description: "***",
    error: "rule condition can`t be empty"
  },
  {
    condition: "***",
    factName: "",
    factValue: "***",
    priority: "***",
    description: "***",
    error: "fact name can`t be empty"
  },
  {
    condition: "***",
    factName: "***",
    factValue: "***",
    priority: "low",
    description: "***",
    error: "rule priority must be a number"
  },
  {
    condition: "***",
    factName: "***",
    factValue: "***",
    priority: -42,
    description: "***",
    error: "rule priority must be a positive number"
  },
  {
    condition: "***",
    factName: "***",
    factValue: "***",
    priority: 42,
    description: "",
    error: "rule description can`t be empty"
  },
];

const conditions = [
  {
    rule: "42",
    calc: "42",
    error: null,
  },
  {
    rule: "36.6",
    calc: "36.6",
    error: null,
  },
  {
    rule: "'horse'",
    calc: "horse",
    error: null,
  },
  {
    rule: "'horse",
    calc: "",
    error: "there is no ' to close string value",
  },
  {
    rule: "'white horse'",
    calc: "white horse",
    error: null,
  },
  {
    rule: "var1",
    calc: "var1",
    error: null,
  },
  {
    rule: "elephants > 42",
    calc: "elephants 42 >",
    error: null,
  },
  {
    rule: "sky = 'light blue'",
    calc: "sky light blue =",
    error: null,
  },
  {
    rule: "animal = 'monkey' AND count = 3",
    calc: "animal monkey = count 3 = AND",
    error: null,
  },
];

// .1 AND Sky = 'light  blue'

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
