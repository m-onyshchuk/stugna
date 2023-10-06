'use strict';
/**
 * Rule example with Else branch
 */

// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run

let options = {
  toSaveEvents: true,
  passCountMax: 8
};
let es = new StugnaES(options);

let facts = [
  {
    name: "hour",
    value: 15,
    description: "Initial value of hour"
  }
];
es.factsImport(facts, false);

let rules = [
  {
    condition: "hour < 12",
    factName: "noon",
    factValue: "will be",
    factNameElse: "noon",
    factValueElse: "passed"
  }
];
es.rulesImport(rules);

let factsAll = es.factsAllAsMap();
console.log (factsAll);

// { hour: 15, noon: 'passed' }