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

  test(`constructor defaults`, () => {
    const toSaveEvents = true;
    const passCountMax = 16;
    let es = new StugnaES();
    expect(es._toSaveEvents).toEqual(toSaveEvents);
    expect(es._passCountMax).toEqual(passCountMax);
  });

  test(`constructor custom`, () => {
    const toSaveEvents = false;
    const passCountMax = 42;
    let es = new StugnaES({toSaveEvents, passCountMax});
    expect(es._toSaveEvents).toEqual(toSaveEvents);
    expect(es._passCountMax).toEqual(passCountMax);
  });

  test(`constructor wrong`, () => {
    const toSaveEvents = true;
    const passCountMax = 16;
    let es = new StugnaES({});
    expect(es._toSaveEvents).toEqual(toSaveEvents);
    expect(es._passCountMax).toEqual(passCountMax);
  });

  test(`method factIsKnown`, () => {
    let es = new StugnaES();
    let fact = {
      name: "factName",
      value: "factValue"
    };
    es.factAdd(fact);
    let known = es.factIsKnown(fact.name);
    let unknown = es.factIsKnown('UNKNOWN_FACT_NAME');
    expect(known).toEqual(true);
    expect(unknown).toEqual(false);
  });

  test(`method factGet`, () => {
    let es = new StugnaES();
    let factInput = {
      name: "factName",
      value: "factValue",
      description: "factDescription",
    };
    es.factAdd(factInput);
    let factKnown = es.factGet(factInput.name);
    let factUnknown = es.factGet('UNKNOWN_FACT_NAME');
    expect(factKnown).not.toEqual(null);
    expect(factKnown.name).toEqual(factInput.name);
    expect(factKnown.value).toEqual(factInput.value);
    expect(factKnown.history).not.toEqual(null);
    expect(Array.isArray(factKnown.history)).toEqual(true);
    expect(factKnown.history[0]).toEqual(expect.stringContaining(factInput.description));
    expect(factUnknown).toEqual(null);
  });

  test(`method factGetPredecessorsWanted / deep case`, () => {
    let es = new StugnaES();
    let rulesIn = [
      {
        condition: "Jack = 'built'",
        factName: "malt",
        factValue: "lay",
      },
      {
        condition: "malt = 'lay'",
        factName: "rat",
        factValue: "ate",
      },
      {
        condition: "rat = 'ate'",
        factName: "cat",
        factValue: "killed",
      },
      {
        condition: "cat = 'killed'",
        factName: "dog",
        factValue: "worried",
      },
      {
        condition: "dog = 'worried'",
        factName: "cow",
        factValue: "crumpled",
      }
    ];
    es.rulesImport(rulesIn);
    let out = es.factGetPredecessorsWanted("cow");
    let expected = ['dog', 'cat', 'rat', 'malt', 'Jack'];
    expect(out).toEqual( expect.arrayContaining(expected));
  });

  test(`method factGetPredecessorsUnknown`, () => {
    let es = new StugnaES();
    let rulesIn = [
      {
        condition: "leafs = 'present' AND tree <> 'fir'",
        factName: "right_branch",
        factValue: "TRUE",
      },
      {
        condition: "leafs = 'present' AND season <> 'winter'",
        factName: "left_branch",
        factValue: "TRUE",
      },
      {
        condition: "left_branch AND right_branch",
        factName: "trunk",
        factValue: "TRUE",
      },
      {
        condition: "trunk = TRUE",
        factName: "root",
        factValue: "TRUE",
      }
    ];
    es.rulesImport(rulesIn);
    let factsIn = [{
      name: "tree",
      value: "linden",
      description: "This tree is linden"
    }];
    es.factsImport(factsIn);
    let factsUnknown = es.factGetPredecessorsUnknown("root");
    let expected = ['leafs', 'season'];
    expect(factsUnknown).toEqual( expect.arrayContaining(expected));
  });

  test(`method factsImport / empty case`, () => {
    let es = new StugnaES();
    let facts = [
      {
        name: "wheels",
        value: 4,
        description: "This transport has 4 wheels"
      },
      {}
    ];
    es.factsImport(facts);
    let events = es.eventsAll();
    expect(events[1].brief).toEqual('fact skip');
  });

  test(`method factsImport / trigger off`, () => {
    let es = new StugnaES();
    let rules = [
      {
        condition: "cats > 2",
        factName: "math",
        factValue: "power"
      }
    ];
    es.rulesImport(rules, false);
    let facts = [
      {
        name: "cats",
        value: 3,
        description: "There are three cats"
      }
    ];
    es.factsImport(facts, false);
    let events = es.eventsAll();
    expect(events.length).toEqual(2);
  });

  test(`method factsImport / trigger off / no logs`, () => {
    let es = new StugnaES({toSaveEvents: false});
    let rules = [
      {
        condition: "cats > 2",
        factName: "math",
        factValue: "power"
      }
    ];
    es.rulesImport(rules, false);
    let facts = [
      {
        name: "cats",
        value: 3,
        description: "There are three cats"
      }
    ];
    es.factsImport(facts, false);
    let events = es.eventsAll();
    expect(events.length).toEqual(0);
  });

  test(`method rulesImport / empty rules`, () => {
    let es = new StugnaES();
    let rulesInput = [{},{},{},{},{},{},{},{},{},{},{},{},{}];
    es.rulesImport(rulesInput);
    let rulesOutput = es.rulesAll();
    expect(rulesOutput.length).toEqual(0);
  });

  test(`method ruleAdd / wrong condition`, () => {
    let es = new StugnaES();
    es.ruleAdd(      {
      condition: "season = winter'",
      factName: "season",
      factValue: "spring",
      priority: 20,
      description: "second to pass"
    });
    let events = es.eventsAll();
    expect(events[0].brief).toEqual('rule error');
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
})
