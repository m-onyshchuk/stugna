'use strict';
const {StugnaES} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

let es = new StugnaES({toExplainMore: true});
let factsIn = [
  {
    name: "factOne",
    value: 1,
    description: '',
  },
];
es.factsImport(factsIn);

let rulesIn = [
  {
    condition: "factOne = 1 OR factTwo = 1",
    factValue: "match",
    factName: "rule",
  }
];
es.ruleAdd(rulesIn[0]);

let events = es.eventsAll();
console.log (events);
