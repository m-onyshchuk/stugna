'use strict';

const {Rule} = require('./rule');

let condition = "grass > -1.12";
let rule = new Rule(condition, 'fact-name', 'fact-value', 10, 'description');
console.log('rule: ', condition);
console.log('calc: ', rule.getCalcString());
console.log('calc: ', rule.calc);
console.log('error:', rule.getError());
console.log();
