'use strict';
const {StugnaES} = require("../stugna-es");

describe('StugnaES extended rule fields', () => {

  test(`Rule.precondition wrong`, () => {
    let es = new StugnaES({toExplainMore: true});
    es.ruleAdd(      {
      precondition: "unknownFact = 42",
      condition: "x > 1",
      factName: "second",
      factValue: "ok branch",
      factNameElse: "second",
      factValueElse: "else branch",
    });
    let factsAll = es.factsAllAsMap(); // { x: 10 }
    expect(factsAll.second).toBeUndefined();
  });

  test(`Rule.precondition met`, () => {
    let es = new StugnaES({toExplainMore: true});
    es.ruleAdd(      {
      precondition: "TRUE",
      condition: "TRUE",
      factName: "fact",
      factValue: "ok",
    });
    let factsAll = es.factsAllAsMap();
    expect(factsAll.fact).toBeDefined();
  });

  test(`Rule.precondition not met`, () => {
    let es = new StugnaES({toExplainMore: true});
    es.ruleAdd(      {
      precondition: "FALSE",
      condition: "TRUE",
      factName: "fact",
      factValue: "ok",
    });
    let factsAll = es.factsAllAsMap();
    expect(factsAll.fact).toBeUndefined();
  });

  test(`Rule.missing`, () => {
    let es = new StugnaES({toExplainMore: true});
    // example 8
    es.factAdd(  {
      name: "B",
      value: 10,
    }, false);
    es.ruleAdd(      {
      condition: "A > 1 OR B > 1",
      missing: 0,
      factName: "C",
      factValue: 20,
    });
    let factsAll = es.factsAllAsMap(); // { B: 10, C: 20 }
    expect(factsAll.C).toEqual(20);
  });

  test(`Rule.final`, () => {
    let es = new StugnaES({toExplainMore: true});
    es.rulesImport([
      {
        condition: "TRUE",
        factName: "A",
        factValue: 1,
        priority: 1,
        final: 3
      },
      {
        condition: "TRUE",
        factName: "A",
        factValue: 20,
        priority: 2,
      },
    ]);
    let factsAll = es.factsAllAsMap(); // { A: }
    expect(factsAll.A).toEqual(1);
  });

})
