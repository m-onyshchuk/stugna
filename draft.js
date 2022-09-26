'use strict';
// const {StugnaES} = require("./stugna-es");
const {Rule} = require('./rule');

const calculations = [
  {
    rule: "NOT FALSE", result: true, facts: {}
  },
];
for (let item of calculations) {
  let rule = new Rule(item.rule, 'fact-name', 'fact-value', 10, 'description');
  let result = rule.check(item.facts);
  console.log(`.${result}.${item.result}.`);
}
