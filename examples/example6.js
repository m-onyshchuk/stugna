'use strict';
/**
 * Rule example with `final` option
 */
// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run
let es = new StugnaES();

let facts = [
  {
    name: "x",
    value: 7,
  }
];
es.factsImport(facts, false);

let rules = [
  {
    condition: "x > 3",
    factName: "y",
    factValue: 3,
    priority: 1,
    final: 1
  },
  {
    condition: "x > 5",
    factName: "y",
    factValue: 5,
    priority: 2
  },
];
es.rulesImport(rules);

let factsAll = es.factsAllAsMap();
console.log (factsAll);
// { x: 7, y: 3 }

let events = es.eventsAll();
console.log (events);

/*
[
  { brief: 'fact add', subject: 'x: 7' },
  { brief: 'rule add', subject: 'x > 3 / {y: 3}' },
  { brief: 'rule add', subject: 'x > 5 / {y: 5}' },
  { brief: 'rule ok', subject: 'x > 3 / {y: 3}' },
  { brief: 'rule final', more: 'Final rule happened' },
  { brief: 'rules passed', more: 'Rules pass count is 1' }
]
*/

