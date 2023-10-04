'use strict';
/**
 * Rule example with `missing` option
 */
// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run
let es = new StugnaES({toExplainMore: true});

let facts = [
  {
    name: "B",
    value: 10,
  }
];
es.factsImport(facts);

let rules = [
  {
    condition: "A > 1 OR B > 1",
    // try to comment line below to see difference
    missing: 0,
    factName: "C",
    factValue: 20,
  },
];
es.rulesImport(rules);

let factsAll = es.factsAllAsMap();
console.log (factsAll);

// A is missing fact
//
// With missing:
// { B: 10, C: 20 }
//
// Without missing:
// { B: 10 }
