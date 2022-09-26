'use strict';
const {Rule} = require('../rule');

const {
  ERROR_RULE_CONDITION_EMPTY,
  ERROR_RULE_FACT_NAME_EMPTY,
  ERROR_RULE_FACT_NAME_HAS_SPACES,
  ERROR_RULE_FACT_VALUE_EMPTY
} = require('../errors-rule');

const validations = [
  {
    condition: "",
    factName: "***",
    factValue: "***",
    priority: "***",
    description: "***",
    error: ERROR_RULE_CONDITION_EMPTY
  },
  {
    condition: "***",
    factName: "",
    factValue: "***",
    priority: "***",
    description: "***",
    error: ERROR_RULE_FACT_NAME_EMPTY
  },
  {
    condition: "***",
    factName: "word1 word2",
    factValue: "***",
    priority: "***",
    description: "***",
    error: ERROR_RULE_FACT_NAME_HAS_SPACES
  },
  {
    condition: "***",
    factName: "***",
    factValue: null,
    priority: "***",
    description: "***",
    error: ERROR_RULE_FACT_VALUE_EMPTY
  }
]

describe('rule validation', () => {
  for (let item of validations) {
    test(`validation: ${item.error}`, () => {
      let rule = new Rule(item.condition, item.factName, item.factValue, item.priority, item.description);
      expect(rule.getError()).toEqual(item.error);
    });
  }
})
