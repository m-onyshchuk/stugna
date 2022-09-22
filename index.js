'use strict';

const {Knowledge} = require("./knowledge");

let rules = [
  {
    condition: "students > 17",
    factName: "classroom",
    factValue: "full",
    priority: 100,
    description: "There are a lot of students in the classroom"
  }
];

let facts = [
  {
    name: "students",
    value: 10,
    description: "A few students came"
  },
  {
    name: "students",
    value: 18,
    description: "A lot of students came"
  }
];

let kb = new Knowledge();
kb.rulesImport(rules);
kb.factsImport(facts);

let events = kb.eventAll();
console.log('events', events);

rules = kb.rulesAll();
console.log('rules', rules);

facts = kb.factsAllAsArray();
console.log('facts-array', facts);

facts = kb.factsAllAsMap();
console.log('facts-map', facts);

let predecessorsWanted = kb.factGetPredecessorsWanted('classroom');
console.log('classroom predecessors wanted', predecessorsWanted);

let predecessorsUnknown = kb.factGetPredecessorsUnknown('classroom');
console.log('classroom predecessors unknown', predecessorsUnknown);
