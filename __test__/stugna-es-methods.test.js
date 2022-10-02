'use strict';
const {StugnaES} = require("../stugna-es");

describe('StugnaES methods', () => {
  test(`public methods`, () => {
    let es = new StugnaES();
    expect(es.ruleAdd).toBeDefined();
    expect(es.rulesImport).toBeDefined();
    expect(es.rulesAll).toBeDefined();
    expect(es.rulesClear).toBeDefined();
    expect(es.factAdd).toBeDefined();
    expect(es.factsImport).toBeDefined();
    expect(es.factsAllAsArray).toBeDefined();
    expect(es.factsAllAsMap).toBeDefined();
    expect(es.factIsKnown).toBeDefined();
    expect(es.factGet).toBeDefined();
    expect(es.factGetPredecessorsWanted).toBeDefined();
    expect(es.factGetPredecessorsUnknown).toBeDefined();
    expect(es.factsAreOrdered).toBeDefined();
    expect(es.factsClear).toBeDefined();
    expect(es.eventsAll).toBeDefined();
    expect(es.eventsClear).toBeDefined();
  });

  test(`rule priority`, () => {
    let es = new StugnaES();
    let rulesIn = [
      {
        condition: "season = 'winter'",
        factName: "season",
        factValue: "spring",
        priority: 20,
        description: "second to pass"
      },
      {
        condition: "season = 'spring'",
        factName: "season",
        factValue: "summer",
        priority: 10,
        description: "first to pass"
      }
    ];
    es.rulesImport(rulesIn);
    let rulesOut = es.rulesAll();
    let ruleLast = rulesOut[rulesOut.length-1];
    expect(ruleLast.description).toEqual("second to pass");
  });

  test(`periodic rule detection`, () => {
    let es = new StugnaES();
    es.rulesImport([
      {
        condition: "now = 'day'",
        factName: "now",
        factValue: "night"
      },
      {
        condition: "now = 'night'",
        factName: "now",
        factValue: "day"
      }
    ]);
    es.factsImport([
      {
        name: "now",
        value: "day",
        description: "Init value"
      }
    ])
    let ordered = es.factsAreOrdered();
    expect(ordered).toEqual(false);
  });

  test(`method rulesClear`, () => {
    let es = new StugnaES();
    es.ruleAdd(      {
      condition: "TRUE",
      factName: "fact",
      factValue: "value",
      priority: 10,
      description: "rule description"
    });
    es.rulesClear();
    let rules = es.rulesAll();
    expect(rules.length).toEqual(0);
  });

  test(`method factsClear`, () => {
    let es = new StugnaES();
    es.factAdd(      {
      name: "fact name",
      value: "fact value",
      description: "fact description"
    });
    es.factsClear();
    let facts = es.factsAllAsArray();
    expect(facts.length).toEqual(0);
  });

  test(`method eventsClear`, () => {
    let es = new StugnaES();
    es.factAdd(      {
      name: "fact name",
      value: "fact value",
      description: "fact description"
    });
    es.eventsClear();
    let events = es.eventsAll();
    expect(events.length).toEqual(0);
  });

})
