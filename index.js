'use strict';

const {StugnaES} = require("./stugna");

let rules = [
  {
    condition: "wheels = 4 AND motor = 'present'",
    factName: "transport",
    factValue: "car"
  },
  {
    condition: "wheels = 2 AND motor = 'present'",
    factName: "transport",
    factValue: "motorcycle"
  },
  {
    condition: "wheels = 4 AND motor = 'missing'",
    factName: "transport",
    factValue: "skateboard"
  },
  {
    condition: "wheels = 2 AND motor = 'missing'",
    factName: "transport",
    factValue: "bike"
  }
];

let facts = [
  {
    name: "wheels",
    value: 4,
    description: "This transport has 2 wheels"
  },
  {
    name: "motor",
    value: "missing",
    description: "This transport does`t have motor"
  }
];

let es = new StugnaES();
es.rulesImport(rules);
es.factsImport(facts);

let events = es.eventAll();
console.log('events', events);

rules = es.rulesAll();
console.log('rules', rules);

facts = es.factsAllAsArray();
console.log('facts-array', facts);

facts = es.factsAllAsMap();
console.log('facts-map', facts);

let factToKnow = 'transport';
let predecessorsWanted = es.factGetPredecessorsWanted(factToKnow);
console.log(`${factToKnow} predecessors wanted`, predecessorsWanted);

let predecessorsUnknown = es.factGetPredecessorsUnknown(factToKnow);
console.log(`${factToKnow} predecessors unknown`, predecessorsUnknown);
