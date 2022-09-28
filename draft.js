'use strict';
/**
 * This is a work draft file for local tests
 */
// const {StugnaES} = require("./stugna-es");
const {Rule} = require('./rule');

const conditions = [
  "TRUE / * - = "
];
for (let condition of conditions) {
  let rule = new Rule(condition, '*', '*', 10, '*');
  let result = rule.check([]);
  console.log(` result: ${result}; condition: "${condition}";`);
}
