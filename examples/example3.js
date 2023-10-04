'use strict';
/**
 * Example from "Periodic rules"
 * A simple case - one pass period
 */

// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run

let options = {
  toSaveEvents: true,
  passCountMax: 2
};
let es = new StugnaES(options);

let facts = [
  {
    name: "season",
    value: "winter",
    description: "Initial value of season fact"
  }
];
es.factsImport(facts, false);

let rules = [
  {
    condition: "season = 'winter'",
    factName: "season",
    factValue: "spring",
    description: "After winter comes spring"
  },
  {
    condition: "season = 'spring'",
    factName: "season",
    factValue: "summer",
    description: "After spring comes summer"
  },
  {
    condition: "season = 'summer'",
    factName: "season",
    factValue: "autumn",
    description: "After summer comes autumn"
  },
  {
    condition: "season = 'autumn'",
    factName: "season",
    factValue: "winter",
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
  { brief: 'fact add', subject: 'Initial value of season fact' },
  { brief: 'rule add', subject: 'After winter comes spring' },
  { brief: 'rule add', subject: 'After spring comes summer' },
  { brief: 'rule add', subject: 'After summer comes autumn' },
  { brief: 'rule add', subject: 'After autumn comes winter' },
  { brief: 'rule ok', subject: 'After winter comes spring' },
  { brief: 'rules passed', more: 'Rules pass count is 1' },
  { brief: 'rule ok', subject: 'After spring comes summer' },
  { brief: 'rules passed', more: 'Rules pass count is 2' },
  { brief: 'rule ok', subject: 'After summer comes autumn' },
  { brief: 'rules passed', more: 'Rules pass count is 3' },
  { brief: 'rule ok', subject: 'After autumn comes winter' },
  { brief: 'rule ok', subject: 'After winter comes spring' },
  { brief: 'rules passed', more: 'Rules pass count is 4' },
  { brief: 'rule ok', subject: 'After spring comes summer' },
  { brief: 'rules passed', more: 'Rules pass count is 5' },
  { brief: 'rule ok', subject: 'After summer comes autumn' },
  { brief: 'rules passed', more: 'Rules pass count is 6' },
  { brief: 'rule ok', subject: 'After autumn comes winter' },
  { brief: 'rule ok', subject: 'After winter comes spring' },
  { brief: 'rules passed', more: 'Rules pass count is 7' },
  { brief: 'rule ok', subject: 'After spring comes summer' },
  { brief: 'rules passed', more: 'Rules pass count is 8' },
  { brief: 'rules error', more: 'Periodic rules detected' }
]
[
  {
    name: 'season',
    value: 'summer',
    history: [
      'Initial value of season fact',
      'rule ok: After winter comes spring',
      'rule ok: After spring comes summer',
      'rule ok: After summer comes autumn',
      'rule ok: After autumn comes winter',
      'rule ok: After winter comes spring',
      'rule ok: After spring comes summer',
      'rule ok: After summer comes autumn',
      'rule ok: After autumn comes winter',
      'rule ok: After winter comes spring',
      'rule ok: After spring comes summer'
    ],
    changed: true
  }
]

*/