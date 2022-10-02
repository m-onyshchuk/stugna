'use strict';
/**
 * This is a work draft file for local tests
 */

// const {Rule} = require('./rule');
// const conditions = [
//   "TRUE"
// ];
// for (let condition of conditions) {
//   let rule = new Rule(condition, '*', '*', 10, '*');
//   let result = rule.check([]);
//   console.log(` result: ${result}; condition: "${condition}";`);
// }

// const {StugnaES} = require("./stugna-es");
// let es = new StugnaES();
// es.factsImport([
//   {
//     name: "fact name",
//     value: "fact value",
//     description: "fact description"
//   }
// ])
// es.eventsClear();
// let events = es.eventsAll();
// console.log(events);

const {ruleApply} = require("./stugna-es");
const condition = "animal = 'monkey')";
const facts = [{name:"animal", value:"cat"}];
let [result, error] = ruleApply(condition, facts);
console.log('result=' + result);
console.log('error=' + error);
//result=true
//error=null
