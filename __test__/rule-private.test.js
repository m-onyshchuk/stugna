'use strict';
const {Rule} = require('../rule');

describe('Rule private methods', () => {

  test(`method _operatorHasLeftAssociativity`, () => {
    let rule = new Rule('1=1', 'a', 'b', 1, 'c');
    let result = rule._operatorHasLeftAssociativity('NOT OPERATOR');
    expect(result).toEqual(null);
  });

  test(`method _operatorPriority`, () => {
    let rule = new Rule('1=1', 'a', 'b', 1, 'c');
    let result = rule._operatorPriority('NOT OPERATOR');
    expect(result).toEqual(null);
  });

  test(`method _mayBeNumber`, () => {
    let rule = new Rule('1=1', 'a', 'b', 1, 'c');
    let result = rule._mayBeNumber();
    expect(result).toEqual(false);
  });

  test(`method _mayBeFloat`, () => {
    let rule = new Rule('1=1', 'a', 'b', 1, 'c');
    let result = rule._mayBeFloat();
    expect(result).toEqual(false);
  });

})
