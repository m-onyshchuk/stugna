'use strict';
// const {StugnaES} = require("./stugna-es");
const {Rule} = require('./rule');

const calculations = [
  {
    rule: "animal1 = 'cat' AND animal2 = 'dog'", result: false, facts: {animal1:{value:'cat'}, animal2:{value:'cat'}}
  },
];
for (let item of calculations) {
  let rule = new Rule(item.rule, 'fact-name', 'fact-value', 10, 'description');
  let result = rule.check(item.facts);
  console.log(`.${result}.${item.result}.`);
}
