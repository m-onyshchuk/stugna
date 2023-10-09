'use strict';
//const {ruleApply, StugnaES} = require("./stugna-es");
const {StugnaES} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

let es = new StugnaES({toExplainMore: true});
es.factAdd(  { name: "factOne", value: 1 }, false);
es.ruleAdd(      {
  condition: "factOne = 1 OR factTwo = 1",
  factValue: "factThree",
  factName: 1
});
let events = es.eventsAll();
console.log(events);
//expect(events[2].brief).toEqual('rule skip');
