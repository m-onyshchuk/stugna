'use strict';

const {
  ERROR_RULE_CONDITION_EMPTY,

  ERROR_RULE_FACT_NAME_EMPTY,
  ERROR_RULE_FACT_NAME_HAS_SPACES,
  ERROR_RULE_FACT_VALUE_EMPTY,

  ERROR_RULE_ELSE_FACT_NAME_HAS_SPACES,
  ERROR_RULE_ELSE_FACT_NAME_ABSENT,
  ERROR_RULE_ELSE_FACT_VALUE_ABSENT,

  ERROR_RULE_STRING_NO_QUOTE,
  ERROR_RULE_PARENTHESES_1,
  ERROR_RULE_PARENTHESES_2
} = require('./errors-rule');

const OPERATORS = {
  '(' :   {priority: 4, arg_count: 2, left_associativity: 1, calc: null },
  ')' :   {priority: 4, arg_count: 2, left_associativity: 1, calc: null },

  '+' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value + b.value } },
  '-' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value - b.value } },
  '*' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value * b.value } },
  '/' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value / b.value } },

  '<' :   {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value <   b.value } },
  '<=' :  {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value <=  b.value } },
  '>' :   {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value >   b.value } },
  '>=' :  {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value >=  b.value } },
  '=' :   {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value === b.value } },
  '<>' :  {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value !== b.value } },
  'LIKE': {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value.toString().indexOf(b.value.toString()) !== -1 } },

  'AND' : {priority: 1, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value && b.value } },
  'OR'  : {priority: 1, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value || b.value } },
  'NOT' : {priority: 1, arg_count: 1, left_associativity: 0, calc: function (a){ return !a.value } }
}

const CHAR_CODE_0 = 48;
const CHAR_CODE_9 = 57;

const TOKEN_UNKNOWN     = 0;
const TOKEN_BOOLEAN     = 1;
const TOKEN_NUMBER      = 2;
const TOKEN_STRING      = 3;
const TOKEN_VARIABLE    = 4;
const TOKEN_OPERATOR    = 5;
const TOKEN_PARENTHESIS = 6;
// const TOKEN_UNKNOWN     = 'UNKNOWN';
// const TOKEN_BOOLEAN     = 'BOOLEAN';
// const TOKEN_NUMBER      = 'NUMBER';
// const TOKEN_STRING      = 'STRING';
// const TOKEN_VARIABLE    = 'VARIABLE';
// const TOKEN_OPERATOR    = 'OPERATOR';
// const TOKEN_PARENTHESIS = 'PARENTHESIS';

const regexpWhiteSpaces = new RegExp('\\s+', 'g');

/**
 *
 */
class Rule {
  /**
   * @param condition {string}
   * @param factName {string}
   * @param factValue {null|number|string}
   * @param priority {number}
   * @param description {string}
   * @param factNameElse {string}
   * @param factValueElse {null|number|string}
   */
  constructor(condition,
              factName, factValue,
              priority, description,
              factNameElse, factValueElse) {
    // init
    this.condition = condition;      // human raw readable text of rule
    this.fact = factName;
    this.value = factValue;
    this.factElse = factNameElse !== undefined ? factNameElse : null;
    this.valueElse = factValueElse !== undefined ? factValueElse : null;
    if (priority && priority > 0)
      this.priority = priority;
    else
      this.priority = 1;
    if (description)
      this.description = description; // detailed rule description
    else
      this.description = `${condition} / ${factName} / ${factValue}`;
    this.error = null;               // rule error
    this.tokens = [];                // parsed rule tokens
    this.calc = [];                  // reverse polish notation for rule condition calculation
    this.variables = [];             // variables list from rule

    this._tokenize(condition);
    this._parse();
    this._collectVariables();
  }

  /**
   * @param name {string}
   */
  _operatorHasLeftAssociativity(name) {
    let operator = OPERATORS[name];
    if (!operator) {
      return null;
    }
    return operator.left_associativity;
  }

  /**
   * @param name {string}
   */
  _operatorPriority(name) {
    let operator = OPERATORS[name];
    if (!operator) {
      return null;
    }
    return operator.priority;
  }

  _mayBeNumber(str) {
    if (!str) {
      return false;
    }
    let code = str.charCodeAt(0);
    return code >= CHAR_CODE_0 && code <= CHAR_CODE_9;
  }

  _mayBeFloat(str) {
    if (!str) {
      return false;
    }
    return str.indexOf('.') !== -1;
  }

  /**
   * Validate rule inputs
   */
  static validate (condition, fact, value, factElse, valueElse) {
    if (!condition) {
      return ERROR_RULE_CONDITION_EMPTY;
    }

    if (!fact) {
      return ERROR_RULE_FACT_NAME_EMPTY;
    }
    if(regexpWhiteSpaces.test(fact)) {
      return ERROR_RULE_FACT_NAME_HAS_SPACES;
    }
    if (value === null || value === undefined) {
      return ERROR_RULE_FACT_VALUE_EMPTY;
    }

    if (factElse || valueElse) {
      if (factElse && (valueElse === null || valueElse === undefined)) {
        return ERROR_RULE_ELSE_FACT_VALUE_ABSENT;
      }
      if (valueElse && (factElse === null || factElse === undefined)) {
        return ERROR_RULE_ELSE_FACT_NAME_ABSENT;
      }
      if(regexpWhiteSpaces.test(factElse)) {
        return ERROR_RULE_ELSE_FACT_NAME_HAS_SPACES;
      }
    }

    return null;
  }

  /**
   * @returns {boolean}
   */
  hasElse() {
    return this.factElse != null;
  }

  /**
   * @param tokens {Object[]}
   */
  checkUnaryMinus(tokens) {
    let result = [];
    let tokenPrev = null;
    for (let i=0; i<tokens.length; i++) {
      let tokenCurrent = tokens[i];
      let tokenNext = null;
      let tokenNextIsNumber = false;
      if (i < tokens.length-1) {
        tokenNext = tokens[i+1];
        tokenNextIsNumber = (tokenNext.type === TOKEN_NUMBER);
      }
      if (tokenCurrent.type === TOKEN_OPERATOR && tokenCurrent.value === '-' && tokenNextIsNumber) {
        let isUnaryMinus = false;
        if (tokenPrev === null) {
          isUnaryMinus = true;
        } else {
          if (tokenPrev.type !== TOKEN_NUMBER) {
            isUnaryMinus = true;
          }
        }
        if (isUnaryMinus) {
          // it`s unary minus
          tokenNext.value *= -1;
        } else {
          // it`s usual minus
          result.push(tokenCurrent);
        }
      } else {
        // it`s not minus
        result.push(tokenCurrent);
      }
      tokenPrev = tokenCurrent;
    }
    return result;
  }

  /**
   * Lexical analysis
   * @param raw {string}
   */
  _tokenize(raw) {
    let tokens = [];

    // preprocess
    raw = raw.replace(/<>/g, '###42@@@'); // protect <> operator from inflation to < >
    raw = raw.replace(/>=/g, '###43@@@');
    raw = raw.replace(/<=/g, '###44@@@');

    // inflate
    let operators = Object.keys(OPERATORS);
    for(let word of operators) {
      let shift = 0;
      let pos = raw.indexOf(word, shift);
      while (pos !== -1) {
        let head = raw.substring(0, pos);
        pos += word.length;
        let tail = raw.substring(pos);
        raw = `${head} ${word} ${tail}`;
        shift = pos + 2;
        pos = raw.indexOf(word, shift);
      }
    }
    raw = raw.trim();

    // postprocess
    raw = raw.replace(/###42@@@/g, '<>'); // back to original notation <>
    raw = raw.replace(/###43@@@/g, '>=');
    raw = raw.replace(/###44@@@/g, '<=');

    // split
    let parts = raw.split(' ');
    let str = [];
    let inStr = 0;
    for (let part of parts) {
      let posQuoteFirst = part.indexOf("'");
      if (posQuoteFirst !== -1) {
        inStr++;
        if (inStr === 1) { // string start
          str = [];
        }
      }

      if (inStr) { // inside 'string with spaces'
        str.push(part);
        let posQuoteSecond = part.indexOf("'", posQuoteFirst+1);
        if (posQuoteSecond !== -1) {
          inStr = 2;
        }
      } else {
        if (part.length > 0) {
          let type = TOKEN_UNKNOWN;
          if (operators.indexOf(part) !== -1) {
            if (part === '(' || part === ')') {
              type = TOKEN_PARENTHESIS
            } else {
              type = TOKEN_OPERATOR;
            }
          } else {
            if (this._mayBeNumber(part)) {
              if (this._mayBeFloat(part)) {
                part = parseFloat(part);
              } else {
                part = parseInt(part);
              }
              type = TOKEN_NUMBER;
            } else {
              if (part === 'TRUE' || part === 'FALSE') {
                type = TOKEN_BOOLEAN;
                if (part === 'TRUE') {
                  part = true;
                } else {
                  part = false;
                }
              } else {
                type = TOKEN_VARIABLE;
              }
            }
          }
          tokens.push({value:part, type});
        }
      }

      if (inStr > 1) { // string end
        str = str.join(' ');
        str = str.replace(/'/g, '');
        tokens.push({value:str, type: TOKEN_STRING});
        str = [];
        inStr = 0;
      }
    }

    if (inStr) {
      this.error = ERROR_RULE_STRING_NO_QUOTE;
      return;
    }

    tokens = this.checkUnaryMinus(tokens);

    this.tokens = tokens;
  }

  /**
   * Shunting yard algorithm - converting infix notation to reverse polish notation
   * https://en.wikipedia.org/wiki/Shunting_yard_algorithm
   */
  _parse() {
    if (this.error) {
      return;
    }

    let output = [];
    let stack = [];
    for (let token of this.tokens) {
      switch (token.type) {
        case TOKEN_BOOLEAN:
        case TOKEN_NUMBER:
        case TOKEN_STRING:
        case TOKEN_VARIABLE:
          output.push(token);
          break;

        case TOKEN_OPERATOR: {
          let operatorCurrent = token;
          while (stack.length) {
            let operatorTop = stack[stack.length - 1];
            if (
              operatorTop.type === TOKEN_OPERATOR && (
                (this._operatorHasLeftAssociativity(operatorCurrent.value) && this._operatorPriority(operatorCurrent.value) <= this._operatorPriority(operatorTop.value))
                ||
                (!this._operatorHasLeftAssociativity(operatorCurrent.value) && this._operatorPriority(operatorCurrent.value) < this._operatorPriority(operatorTop.value))
              )
            ) {
              output.push(operatorTop);
              stack.pop();
            } else {
              break;
            }
          }
          stack.push(operatorCurrent);
        }
        break;

        case TOKEN_PARENTHESIS: {
          if (token.value === '(') {
            stack.push(token);
          }
          if (token.value === ')') {
            let pe = false;
            while (stack.length) {
              let operatorTop = stack[stack.length - 1];
              if (operatorTop.value === '(') {
                pe = true;
                break;
              } else {
                output.push(operatorTop);
                stack.pop();
              }
            }
            if (!pe) {
              this.error = ERROR_RULE_PARENTHESES_1;
              return;
            }
            stack.pop();
          }
        }
        break;
      }
    }

    while(stack.length) {
      let operatorTop = stack[stack.length-1];
      if(operatorTop.value === '(' || operatorTop.value === ')') {
        this.error = ERROR_RULE_PARENTHESES_2;
        return;
      }
      output.push(operatorTop);
      stack.pop();
    }

    this.calc = output;
  }

  /**
   * Collect variable names from parsed reverse polish notation
   */
  _collectVariables() {
    if (this.error) {
      return;
    }

    this.variables = [];
    for (let token of this.calc) {
      if (token.type === TOKEN_VARIABLE) {
        let exist = this.variables.includes(token.value);
        if (!exist) {
          this.variables.push(token.value);
        }
      }
    }
  }

  /**
   * Get parsing error
   */
  getError() {
    return this.error;
  }

  /**
   * Get prepared reverse polish notation from this.calc
   * @returns {string}
   */
  getCalcString() {
    let str = '';
    str = this.calc.map(token => token.value).join(' ');
    return str;
  }

  /**
   * Calc prepared reverse polish notation in this.calc
   * @param facts
   * @param diagnostics
   * @returns {boolean}
   */
  check (facts, diagnostics) {
    let result = false;
    // let allowConsoleLog = !PROD;
    try {
      // 1) check wanted variables
      for (let variable of this.variables) {
        if (facts[variable] === undefined) {
          if (diagnostics.toExplainMore) {
            diagnostics.missingFact = variable;
          }
          return false; // rule variable is absent, break rule checking
        }
      }

      // 2) calc reverse polish notation
      let stack = [];
      for (let item of this.calc) {
        let token = Object.assign({}, item);
        switch (token.type) {
          case TOKEN_BOOLEAN:
          case TOKEN_NUMBER:
          case TOKEN_STRING:
            stack.push(token);
            break;

          case TOKEN_VARIABLE: {
              let name = token.value;
              let value = facts[name].value;
              token.value = value;
              stack.push(token);
            }
            break;

          case TOKEN_OPERATOR: {
              let operator = OPERATORS[token.value];
              let a = null;
              let b = null;
              if (operator.arg_count === 2) {
                b = stack.pop();
                a = stack.pop();
              } else {
                a = stack.pop();
              }
              let result = operator.calc(a, b);
              if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
                result = false;
                // if (allowConsoleLog) {
                //   console.error(`rule: ${this.condition}; error: NaN detected;`);
                // }
              }
              stack.push({value: result, type: TOKEN_BOOLEAN});
            }
            break;
        }
      }

      if (stack.length === 1) {
        result = stack[0].value;
      } else {
        // error
        this.error = `rule: ${this.condition}; error: calc failed (${JSON.stringify(stack)})`;
        // if (allowConsoleLog) {
        //   console.error(this.error);
        // }
      }
    } catch (error) {
      this.error = `rule: ${this.condition}; error in condition`;
      // if (allowConsoleLog) {
      //   this.error = `rule: ${this.condition}; error: ${error.message};`;
      //   console.error(this.error);
      // }
    }

    return result;
  }
}

module.exports = {Rule}