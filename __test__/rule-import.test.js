'use strict';

const {
  ERROR_RULE_CONDITION_EMPTY,
  ERROR_RULE_FACT_NAME_EMPTY,
  ERROR_RULE_FACT_NAME_HAS_SPACES,
  ERROR_RULE_FACT_VALUE_EMPTY,

  ERROR_RULE_ELSE_FACT_NAME_HAS_SPACES,
  ERROR_RULE_ELSE_FACT_NAME_ABSENT,
  ERROR_RULE_ELSE_FACT_VALUE_ABSENT,

} = require('../errors-rule');
const {StugnaES} = require("../stugna-es");

const importVariants = [
  {
    rules: [{
      // condition: "TRUE",
      factName: "***",
      factValue: "***",
    }],
    error: ERROR_RULE_CONDITION_EMPTY,
  },
  {
    rules: [{
      condition: "TRUE",
      // factName: "***",
      factValue: "***",
    }],
    error: ERROR_RULE_FACT_NAME_EMPTY,
  },
  {
    rules: [{
      condition: "TRUE",
      factName: "***",
      // factValue: "***",
    }],
    error: ERROR_RULE_FACT_VALUE_EMPTY,
  },
  {
    rules: [{
      condition: "TRUE",
      factName: "part1 and part2",
      factValue: "***",
    }],
    error: ERROR_RULE_FACT_NAME_HAS_SPACES,
  },
  {
    rules: [{
      condition: "TRUE",
      factName: "***",
      factValue: "***",
      factNameElse: "part1 and part2",
      factValueElse: "###",
    }],
    error: ERROR_RULE_ELSE_FACT_NAME_HAS_SPACES,
  },
  {
    rules: [{
      condition: "TRUE",
      factName: "***",
      factValue: "***",
      factNameElse: "###",
    }],
    error: ERROR_RULE_ELSE_FACT_VALUE_ABSENT,
  },
  {
    rules: [{
      condition: "TRUE",
      factName: "***",
      factValue: "***",
      factValueElse: "###",
    }],
    error: ERROR_RULE_ELSE_FACT_NAME_ABSENT,
  },
]

describe('Rules import', () => {
  for (let item of importVariants) {
    test(`import: ${item.error}`, () => {
      let es = new StugnaES();
      es.rulesImport(item.rules, false);
      let events = es.eventsAll();
      expect(events.length).toEqual(1);
      let event = events[0];
      expect(item.error).toEqual(event.more);
    });
  }
})
