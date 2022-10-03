'use strict';
const {StugnaES, ruleApply} = require("./stugna-es");
const {Rule} = require("./rule");
/**
 * This is a work draft file for local tests
 */

const condition = '42 12';
let rule = new Rule(condition, 'a', 'b', 1, 'c');

let result = rule.check({});
console.log(result);

let error = rule.getError();
console.log(error);

