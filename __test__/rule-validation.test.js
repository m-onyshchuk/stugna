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
    error: ERROR_RULE_CONDITION_EMPTY
  },
  {
    // condition: "", // condition is absent
    factName: "***",
    factValue: "***",
    error: ERROR_RULE_CONDITION_EMPTY
  },
  {
    condition: "***",
    factName: "",
    factValue: "***",
    error: ERROR_RULE_FACT_NAME_EMPTY
  },
  {
    condition: "***",
    // factName: "", // factName is absent
    factValue: "***",
    error: ERROR_RULE_FACT_NAME_EMPTY
  },
  {
    condition: "***",
    factName: "word1 word2",
    factValue: "***",
    error: ERROR_RULE_FACT_NAME_HAS_SPACES
  },
  {
    condition: "***",
    factName: "***",
    factValue: null,
    error: ERROR_RULE_FACT_VALUE_EMPTY
  },
  {
    condition: "***",
    factName: "***",
    // factValue: null, // factValue is absent
    error: ERROR_RULE_FACT_VALUE_EMPTY
  },
]

describe('Rule validation', () => {
  for (let item of validations) {
    test(`validation: ${item.error}`, () => {
      let ruleError = Rule.validate(item.condition, item.factName, item.factValue);
      expect(item.error).toEqual(ruleError);
    });
  }
})
