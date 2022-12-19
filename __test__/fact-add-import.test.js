'use strict';

const {
  ERROR_FACT_NAME_ABSENT,
  ERROR_FACT_NAME_EMPTY,
  ERROR_FACT_VALUE_ABSENT,
} = require('../errors-fact');
const {StugnaES} = require("../stugna-es");

const importVariants = [
  {
    facts: [{
      //name: "factName",
      value: 42,
    }],
    more: ERROR_FACT_NAME_ABSENT,
  },
  {
    facts: [{
      name: "",
      value: 42,
    }],
    more: ERROR_FACT_NAME_EMPTY,
  },
  {
    facts: [{
      name: "factName",
      //value: 42,
    }],
    more: ERROR_FACT_VALUE_ABSENT,
  },
]

describe('Facts add', () => {
  for (let item of importVariants) {
    test(`add: ${item.more}`, () => {
      let es = new StugnaES();
      let fact = item.facts[0];
      es.factAdd({name: fact.name, value: fact.value, decsription: null});
      let events = es.eventsAll();
      expect(events.length).toEqual(1);
      let event = events[0];
      expect(item.more).toEqual(event.more);
    });
  }
})

describe('Facts import', () => {
  for (let item of importVariants) {
    test(`import: ${item.more}`, () => {
      let es = new StugnaES();
      es.factsImport(item.facts, false);
      let events = es.eventsAll();
      expect(events.length).toEqual(1);
      let event = events[0];
      expect(item.more).toEqual(event.more);
    });
  }
})

