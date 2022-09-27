'use strict';
const {Rule} = require('../rule');
const calculations = [
  { rule: "TRUE", result: true, facts: {} },
  { rule: "FALSE = FALSE", result: true, facts: {} },
  { rule: "TRUE <> FALSE", result: true, facts: {} },
  { rule: "TRUE = FALSE", result: false, facts: {} },
  { rule: "2 + 3 = 5", result: true, facts: {} },
  { rule: "'lazy_dog' = 'lazy' + '_' + 'dog'", result: true, facts: {} },
  { rule: "8 - 2 = 6", result: true, facts: {} },
  { rule: "2 - 8 = -6", result: true, facts: {} },
  { rule: "-6 = 2 - 8", result: true, facts: {} },
  { rule: "-2 > -8", result: true, facts: {} },
  { rule: "4 * 2 = 8", result: true, facts: {} },
  { rule: "cats > 2 * dogs", result: true, facts: {cats:{value:9}, dogs:{value:4}} },
  { rule: "16 / 2 = 8", result: true, facts: {} },
  { rule: "16 / 0 = 0", result: true, facts: {} },
  { rule: "2 > 1", result: true, facts: {} },
  { rule: "2.0 > 1", result: true, facts: {} },
  { rule: "2 < 3", result: true, facts: {} },
  { rule: "2.0 < 3", result: true, facts: {} },
  { rule: "2.0 = 2", result: true, facts: {} },
  { rule: "'mouse' = 'mouse'", result: true, facts: {} },
  { rule: "'mouse' <> 'cat'", result: true, facts: {} },
  { rule: "'mouse' > 'cat'", result: true, facts: {} },
  { rule: "animal = 'cat'", result: true, facts: {animal:{value:'cat'}} },
  { rule: "animal <> 'mouse'", result: true, facts: {animal:{value:'cat'}} },
  { rule: "'The quick brown fox jumps over the lazy dog' LIKE 'fox'", result: true, facts: {} },
  { rule: "'The quick brown fox jumps over the lazy dog' LIKE 'cat'", result: false, facts: {} },
  { rule: "animal1 = animal2", result: true, facts: {animal1:{value:'cat'}, animal2:{value:'cat'}} },
  { rule: "animal = 'cat' OR animal = 'dog'", result: true, facts: {animal:{value:'cat'}} },
  { rule: "animal = 'cat' OR animal = 'dog'", result: false, facts: {} },
  { rule: "animal1 = 'cat' AND animal2 = 'dog'", result: false, facts: {animal1:{value:'cat'}, animal2:{value:'cat'}} },
  { rule: "animal1 = 'cat' AND animal2 = 'dog'", result: true, facts: {animal1:{value:'cat'}, animal2:{value:'dog'}} },
  { rule: "NOT FALSE", result: true, facts: {} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'cat'}, food:{value:'milk'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'dog'}, food:{value:'milk'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'cat'}, food:{value:'meat'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'dog'}, food:{value:'meat'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: false, facts: {animal:{value:'pig'}, food:{value:'milk'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: false, facts: {animal:{value:'cat'}, food:{value:'cake'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND NOT (food = 'milk' OR food = 'meat')", result: true, facts: {animal:{value:'cat'}, food:{value:'cake'}} },
];

describe('rule calculation', () => {
  for (let item of calculations) {
    test(`condition: ${item.rule}`, () => {
      let rule = new Rule(item.rule, 'fact-name', 'fact-value', 10, 'description');
      let result = rule.check(item.facts);
      expect(result).toEqual(item.result);
    });
  }
})
