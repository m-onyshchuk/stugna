'use strict';

const {Rule} = require('./rule');

let condition = "((grass = 'green') AND (sky = 'light blue'))";
let rule = new Rule(condition, 'fact-name', 'fact-value', 10, 'description');
console.log('rule: ', condition);
console.log('calc: ', rule.getCalcString());
console.log('error:', rule.getError());
console.log();
