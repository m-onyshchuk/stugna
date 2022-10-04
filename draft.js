'use strict';
const {StugnaES} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

let es = new StugnaES();
let rulesIn = [
  {
    condition: "leafs = 'present' AND tree <> 'fir'",
    factName: "right_branch",
    factValue: "TRUE",
  },
  {
    condition: "leafs = 'present' AND season <> 'winter'",
    factName: "left_branch",
    factValue: "TRUE",
  },
  {
    condition: "left_branch AND right_branch",
    factName: "trunk",
    factValue: "TRUE",
  },
  {
    condition: "trunk = TRUE",
    factName: "root",
    factValue: "TRUE",
  }
];
es.rulesImport(rulesIn);
let factsIn = [{
  name: "tree",
  value: "linden",
  description: "This tree is linden"
}];
es.factsImport(factsIn);
let unknown = es.factGetPredecessorsUnknown("root");
console.log (unknown);
// [ 'leafs', 'season' ]

