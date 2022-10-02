'use strict';
const {ruleApply} = require("../stugna-es");
const {
  ERROR_RULE_PARENTHESES_1
} = require('../errors-rule');

describe('ruleApply', () => {
  test(`case ok`, () => {
    const condition = "animal = 'cat' OR animal = 'dog'";
    const facts = [{name:"animal", value:"cat"}];
    let [result, error] = ruleApply(condition, facts);
    expect(result).toEqual(true);
    expect(error).toEqual(null);
  });

  test(`case error`, () => {
    const condition = "animal = 'monkey')";
    const facts = [{name:"animal", value:"cat"}];
    let [result, error] = ruleApply(condition, facts);
    expect(result).toEqual(false);
    expect(error).toEqual(ERROR_RULE_PARENTHESES_1);
  });

})
