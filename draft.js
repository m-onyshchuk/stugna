'use strict';
const {StugnaES, ruleApply} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

const condition = "12 ===";
const facts = [];
let [result, error] = ruleApply(condition, facts);
console.log(result);
console.log(error);

