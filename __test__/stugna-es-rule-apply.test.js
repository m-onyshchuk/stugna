'use strict';
const {ruleApply} = require("../stugna-es");
const {
  ERROR_RULE_PARENTHESES_1
} = require('../errors-rule');

describe('Function ruleApply', () => {
  test(`case ok`, () => {
    const condition = "animal = 'cat' OR animal = 'dog'";
    const facts = [{name:"animal", value:"cat"}, {hello:"world"}];
    let [result, error] = ruleApply(condition, facts);
    expect(result).toEqual(true);
    expect(error).toEqual(null);
  });

  test(`case error / condition / parsing`, () => {
    const condition = "animal = 'monkey')";
    const facts = [{name:"animal", value:"cat"}];
    let [result, error] = ruleApply(condition, facts);
    expect(result).toEqual(false);
    expect(error).toContain(ERROR_RULE_PARENTHESES_1);
  });

  test(`case error / condition / wrong`, () => {
    const condition = "12 ===";
    const facts = [];
    let [result, error] = ruleApply(condition, facts);
    expect(result).toEqual(false);
    expect(error).toContain("error in condition"); // "rule: 12 ===; error in condition"
  });

  test(`case error / condition / missing facts`, () => {
    const condition = "cats > 12";
    const facts = [];
    let [result, error] = ruleApply(condition, facts);
    expect(result).toEqual(false);
    expect(error).toContain("missing facts:"); // "missing facts: cats"
  });

})
