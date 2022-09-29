'use strict';
/**
 * Extended example for periodic rules
 * Three pass period
 */

// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run

let options = {
  toSaveEvents: true,
  passCountMax: 10
};
let es = new StugnaES(options);

let facts = [
  {
    name: "season",
    value: "winter",
    description: "Initial value of season fact"
  }
];
es.factsImport(facts);

let rules = [
  {
    condition: "season = 'winter'",
    factName: "season",
    factValue: "spring",
    priority: 40,
    description: "After winter comes spring"
  },
  {
    condition: "season = 'spring'",
    factName: "season",
    factValue: "summer",
    priority: 30,
    description: "After spring comes summer"
  },
  {
    condition: "season = 'summer'",
    factName: "season",
    factValue: "autumn",
    priority: 20,
    description: "After summer comes autumn"
  },
  {
    condition: "season = 'autumn'",
    factName: "season",
    factValue: "winter",
    priority: 10,
    description: "After autumn comes winter"
  },
];
let isTrigger = true;
es.rulesImport(rules, isTrigger);

let ordered = es.factsAreOrdered();
console.log (ordered);

let events = es.eventsAll();
console.log (events);

facts = es.factsAllAsArray();
console.log (facts);

/*
false
[
  { brief: 'fact add', more: 'Initial value of season fact' },
  { brief: 'rule add', more: 'After winter comes spring' },
  { brief: 'rule add', more: 'After spring comes summer' },
  { brief: 'rule add', more: 'After summer comes autumn' },
  { brief: 'rule add', more: 'After autumn comes winter' },
  { brief: 'rule ok', more: 'After winter comes spring' },
  { brief: 'rule ok', more: 'After spring comes summer' },
  { brief: 'rule ok', more: 'After summer comes autumn' },
  { brief: 'rule ok', more: 'After autumn comes winter' },
  { brief: 'rules passed', more: 'Rules pass count is 1' },
  { brief: 'rule ok', more: 'After winter comes spring' },
  { brief: 'rule ok', more: 'After spring comes summer' },
  { brief: 'rule ok', more: 'After summer comes autumn' },
  { brief: 'rule ok', more: 'After autumn comes winter' },
  { brief: 'rules passed', more: 'Rules pass count is 2' },
  { brief: 'rules error', more: 'Periodic rules detected' }
]
*/