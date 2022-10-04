'use strict';
/**
 * Example from "API details"
 */
///
// const {StugnaES} = require("stugna-es"); // for standalone run
const {StugnaES} = require("../stugna-es"); // for local run
let options = {
  toSaveEvents: true
};
let es = new StugnaES(options);

///
let rule = {
  condition: "weight > 20000",
  factName: "transport",
  factValue: "bus",
  priority: 10,
  description: "Transport with weight more than 20 ton looks like a bus"
};
let isTrigger = true;
es.ruleAdd(rule, isTrigger);

///
let rules = [
  {
    condition: "wheels = 4 AND motor = 'present'",
    factName: "transport",
    factValue: "car",
    priority: 10,
    description: "Transport with engine and 4 wheels is a car"
  },
  {
    condition: "wheels = 2 AND motor = 'present'",
    factName: "transport",
    factValue: "motorcycle",
    priority: 10,
    description: "Transport with engine and 2 wheels is a motorcycle"
  },
  {
    condition: "wheels = 4 AND motor = 'missing'",
    factName: "transport",
    factValue: "skateboard",
    priority: 10,
    description: "Transport with 4 wheels and without engine is a skateboard"
  },
  {
    condition: "wheels = 2 AND motor = 'missing'",
    factName: "transport",
    factValue: "bike",
    priority: 10,
    description: "Transport with 2 wheels and without engine is a bike"
  }
];
isTrigger = true;
es.rulesImport(rules, isTrigger);

///
let rulesAll = es.rulesAll();
console.log ('\n--- rulesAll ---');
console.log (rulesAll);

///
// es.rulesClear();

///
let fact = {
  name: "wheels",
  value: 2,
  description: "Transport has 2 wheels"
};
isTrigger = true;
es.factAdd(fact, isTrigger);

///
let facts = [
  {
    name: "wheels",
    value: 4,
    description: "This transport has 4 wheels"
  },
  {
    name: "motor",
    value: "missing",
    description: "This transport does`t have motor"
  }
];
es.factsImport(facts);

///
let factsArray = es.factsAllAsArray();
console.log ('\n--- factsArray ---');
console.log (factsArray);

///
let factsMap = es.factsAllAsMap();
console.log ('\n--- factsMap ---');
console.log (factsMap);

///
let name = "wheels";
let isKnown = es.factIsKnown(name);
console.log ('\n--- factIsKnown ---');
console.log (isKnown);

///
name = "wheels";
fact = es.factGet(name);
console.log ('\n--- factGet ---');
console.log (fact);

name = 'transport';
let wanted = es.factGetPredecessorsWanted(name);
console.log ('\n--- factGetPredecessorsWanted ---');
console.log (wanted);

let unknown = es.factGetPredecessorsUnknown(name);
console.log ('\n--- factGetPredecessorsUnknown ---');
console.log (unknown);

let ordered = es.factsAreOrdered();
console.log ('\n--- factsAreOrdered ---');
console.log (ordered);

///
// es.factsClear();

let events = es.eventsAll();
console.log ('\n--- eventsAll ---');
console.log (events);

///
// es.eventsClear();
