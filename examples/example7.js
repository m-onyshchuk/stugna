'use strict';
/**
 * Rule example with precondition
 */
// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run
let es = new StugnaES({toExplainMore: true});

let facts = [
  {
    name: "x",
    value: 10,
  }
];
es.factsImport(facts);

let rules = [
  {
    precondition: "unknownFact = 42",
    condition: "x > 1",
    factName: "second",
    factValue: "ok branch",
    factNameElse: "second",
    factValueElse: "else branch",
  },
];
es.rulesImport(rules);

let factsAll = es.factsAllAsMap();
console.log (factsAll);

// Without precondition:
// { x: 10, second: 'ok branch' }
//
// With precondition:
// { x: 10 }