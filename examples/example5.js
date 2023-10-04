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

facts = es.factsAllAsArray();
console.log (facts);

let events = es.eventsAll();
console.log (events);

/*
[
  {
    name: 'hour',
    value: 15,
    history: [ 'Initial value of hour' ],
    changed: false
  },
  {
    name: 'noon',
    value: 'passed',
    history: [ 'rule else: hour < 12 / {noon: will be} / {noon: passed}' ],
    changed: true
  }
]
[
  { brief: 'fact add', subject: 'Initial value of hour' },
  {
    brief: 'rule add',
    subject: 'hour < 12 / {noon: will be} / {noon: passed}'
  },
  {
    brief: 'rule else',
    subject: 'hour < 12 / {noon: will be} / {noon: passed}'
  },
  { brief: 'rules passed', more: 'Rules pass count is 1' },
  { brief: 'rules passed', more: 'Rules pass count is 2' }
]
*/