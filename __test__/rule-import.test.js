'use strict';

const {
  ERROR_RULE_CONDITION_EMPTY,
  ERROR_RULE_FACT_NAME_EMPTY,
  ERROR_RULE_FACT_VALUE_EMPTY
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
