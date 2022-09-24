'use strict';

const {StugnaES} = require("./stugna-es");
let es = new StugnaES();

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
es.rulesImport(rules);

let factsUnknown = es.factGetPredecessorsUnknown(`transport`);
console.log(factsUnknown);
// [ 'wheels', 'motor' ]

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

let factWanted = es.factGetValue(`transport`);
console.log(factWanted);
// {
//   name: 'transport',
//   value: 'skateboard',
//   history: [ "rule: wheels = 4 AND motor = 'missing'" ]
// }
