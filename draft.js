'use strict';
const {ruleApply, StugnaES} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

const condition = "2 >= 1";
const facts = [];
let [result, error] = ruleApply(condition, facts);
console.log(result);
console.log(error);