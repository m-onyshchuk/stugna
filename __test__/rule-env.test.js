'use strict';
const {Rule} = require('../rule');
const calculations = [
  // boolean
  { rule: "TRUE", result: true, facts: {} },
  { rule: "FALSE", result: false, facts: {} },
  { rule: "FALSE = FALSE", result: true, facts: {} },
  { rule: "TRUE <> FALSE", result: true, facts: {} },
  { rule: "TRUE = FALSE", result: false, facts: {} },
  { rule: "TRUE AND FALSE", result: false, facts: {} },
  { rule: "TRUE OR FALSE", result: true, facts: {} },
  { rule: "NOT FALSE", result: true, facts: {} },

  // numbers, arithmetic
  { rule: "2 + 3 = 5", result: true, facts: {} },
  { rule: "8 - 2 = 6", result: true, facts: {} },
  { rule: "2 - 8 = -6", result: true, facts: {} },
  { rule: "-6 = 2 - 8", result: true, facts: {} },
  { rule: "-2 > -8", result: true, facts: {} },
  { rule: "4 * 2 = 8", result: true, facts: {} },
  { rule: "16 / 2 = 8", result: true, facts: {} },
  { rule: "16 / 0 = 0", result: false, facts: {} },
  { rule: "2 > 1", result: true, facts: {} },
  { rule: "2.0 > 1", result: true, facts: {} },
  { rule: "2 < 3", result: true, facts: {} },
  { rule: "2.0 < 3", result: true, facts: {} },
  { rule: "2.0 = 2", result: true, facts: {} },

  // strings
  { rule: "'mouse' = 'mouse'", result: true, facts: {} },
  { rule: "'mouse' <> 'cat'", result: true, facts: {} },
  { rule: "'mouse' > 'cat'", result: true, facts: {} },
  { rule: "'lazy_dog' = 'lazy' + '_' + 'dog'", result: true, facts: {} },
  { rule: "'The quick brown fox jumps over the lazy dog' LIKE 'fox'", result: true, facts: {} },
  { rule: "'The quick brown fox jumps over the lazy dog' LIKE 'cat'", result: false, facts: {} },

  // fact values
  { rule: "animal = 'cat'", result: true, facts: {animal:{value:'cat'}} },
  { rule: "animal <> 'mouse'", result: true, facts: {animal:{value:'cat'}} },
  { rule: "animal1 = animal2", result: true, facts: {animal1:{value:'cat'}, animal2:{value:'cat'}} },
  { rule: "cats > 2 * dogs", result: true, facts: {cats:{value:9}, dogs:{value:4}} },

  // OR, AND, NOT
  { rule: "animal = 'cat' OR animal = 'dog'", result: true, facts: {animal:{value:'cat'}} },
  { rule: "animal = 'cat' OR animal = 'dog'", result: false, facts: {} },
  { rule: "animal1 = 'cat' AND animal2 = 'dog'", result: false, facts: {animal1:{value:'cat'}, animal2:{value:'cat'}} },
  { rule: "animal1 = 'cat' AND animal2 = 'dog'", result: true, facts: {animal1:{value:'cat'}, animal2:{value:'dog'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'cat'}, food:{value:'milk'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'dog'}, food:{value:'milk'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'cat'}, food:{value:'meat'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: true,  facts: {animal:{value:'dog'}, food:{value:'meat'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: false, facts: {animal:{value:'pig'}, food:{value:'milk'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND (food = 'milk' OR food = 'meat')", result: false, facts: {animal:{value:'cat'}, food:{value:'cake'}} },
  { rule: "(animal = 'cat' OR animal = 'dog') AND NOT (food = 'milk' OR food = 'meat')", result: true, facts: {animal:{value:'cat'}, food:{value:'cake'}} },

  // wrong cases
  { rule: "12 12", result: false, facts: {} },
];

describe('Rule with NODE_ENV modes', () => {

  test(`NODE_ENV = prod`, () => {
    process.env.NODE_ENV = 'prod';
    let condition = "(animal = 'cat' OR animal = 'dog') AND NOT (food = 'milk' OR food = 'meat')";
    let facts = {animal:{value:'cat'}, food:{value:'cake'}};
    let rule = new Rule(condition, 'fact-name', 'fact-value', 10, 'description');
    let result = rule.check(facts);
    expect(process.env.NODE_ENV).toEqual('prod');
    expect(result).toEqual(true);
  });

  test(`NODE_ENV = develop`, () => {
    process.env.NODE_ENV = 'develop';
    let condition = "(animal = 'cat' OR animal = 'dog') AND NOT (food = 'milk' OR food = 'meat')";
    let facts = {animal:{value:'cat'}, food:{value:'cake'}};
    let rule = new Rule(condition, 'fact-name', 'fact-value', 10, 'description');
    let result = rule.check(facts);
    expect(process.env.NODE_ENV).toEqual('develop');
    expect(result).toEqual(true);
  });

})
