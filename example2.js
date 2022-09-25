'use strict';
const {StugnaES} = require("./stugna-es");
let options = {
  toSaveEvents: true
};
let es = new StugnaES(options);

let rule = {
  condition: "weight > 20000",
  factName: "transport",
  factValue: "bus",
  priority: 10,
  description: "Transport with weight more than 20 ton looks like a bus"
};
es.ruleAdd(rule);

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
es.rulesImport(rules);

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
es.factsImport(facts);

let name = 'transport';

let wanted = es.factGetPredecessorsWanted(name);
console.log (wanted);

let unknown = es.factGetPredecessorsUnknown(name);
console.log (unknown);

let events = es.eventsAll();
console.log (events);
