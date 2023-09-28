'use strict';
/**
 * Rule example with final option
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
es.factsImport(facts);

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

let events = es.eventsAll();
console.log (events);

// {
//   name: 'transport',
//     value: 'skateboard',
//   history: [
//   "rule ok: wheels = 4 AND motor = 'missing' / transport / skateboard"
// ],
//   changed: true
// }

