'use strict';
const {StugnaES} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

let es = new StugnaES();
let factsIn = [
  {
    name: "factOne",
    value: 1,
    description: '',
  },
/*
  // {
  //   name: "factTwo",
  //   value: 0,
  //   description: '+',
  // },
  {
    name: "factThree",
    value: 1,
    description: '',
  },
  // {
  //   name: "factFour",
  //   value: 0,
  //   description: '+',
  // },
  {
    name: "factFive",
    value: 1,
    description: '',
  },
  {
    name: "factSix",
    value: 1,
    description: '',
  },
  {
    name: "factSeven",
    value: 1,
    description: '',
  },
  // {
  //   name: "factEight",
  //   value: 0,
  //   description: '+',
  // },
*/
];
es.factsImport(factsIn);

let rulesIn = [
  {
    condition: "factOne = 1 OR factTwo = 1",
    // condition: "(factOne = 1 OR factTwo = 1) AND " +
    //   "factThree = 1 AND " +
    //   "(factFour = 1 OR factFive = 1) AND " +
    //   "factSix = 1 AND " +
    //   "(factSeven = 1 OR factEight = 1)",
    // factValue: "match",
    // factName: "rule",
  }
];
es.ruleAdd(rulesIn[0]);
// es.rulesImport(rulesIn);


let events = es.eventsAll();
console.log (events);
