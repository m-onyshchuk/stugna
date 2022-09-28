'use strict';
const {
  ERROR_RULE_CONDITION_EMPTY,
  ERROR_RULE_FACT_NAME_EMPTY,
  ERROR_RULE_FACT_NAME_HAS_SPACES,
  ERROR_RULE_FACT_VALUE_EMPTY,
  ERROR_RULE_STRING_NO_QUOTE,
  ERROR_RULE_PARENTHESES_1,
  ERROR_RULE_PARENTHESES_2
} = require('./errors-rule');

const OPERATORS = {
  '(' :   {priority: 4, arg_count: 2, left_associativity: 1, calc: function (a, b){ } },
  ')' :   {priority: 4, arg_count: 2, left_associativity: 1, calc: function (a, b){ } },

  '+' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value + b.value } },
  '-' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value - b.value } },
  '*' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value * b.value } },
  '/' :   {priority: 3, arg_count: 2, left_associativity: 1, calc: function (a, b){ return b.value !== 0 ? a.value / b.value : 0 } },

  '<' :   {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value < b.value } },
  '>' :   {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value > b.value } },
  '=' :   {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value === b.value } },
  '<>' :  {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value !== b.value } },
  'LIKE': {priority: 2, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value.toString().indexOf(b.value.toString()) !== -1 } },

  'AND' : {priority: 1, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value && b.value } },
  'OR'  : {priority: 1, arg_count: 2, left_associativity: 1, calc: function (a, b){ return a.value || b.value } },
  'NOT' : {priority: 1, arg_count: 1, left_associativity: 0, calc: function (a, b){ return !a.value } }
}
const regexpWhiteSpaces = new RegExp('\\s+', 'g');

/**
 * @param name {string}
 */
function operatorHasLeftAssociativity(name) {
  let operator = OPERATORS[name];
  if (!operator) {
    return null;
  }
  return operator.left_associativity;
}

/**
 * @param name {string}
 */
function operatorPriority(name) {
  let operator = OPERATORS[name];
  if (!operator) {
    return null;
  }
  return operator.priority;
}

const PROD = process.env.NODE_ENV !== 'develop';
const TOKEN_UNKNOWN     = PROD ? 0 : 'UNKNOWN';
const TOKEN_BOOLEAN     = PROD ? 1 : 'BOOLEAN';
const TOKEN_NUMBER      = PROD ? 2 : 'NUMBER';
const TOKEN_STRING      = PROD ? 3 : 'STRING';
const TOKEN_VARIABLE    = PROD ? 4 : 'VARIABLE';
const TOKEN_OPERATOR    = PROD ? 5 : 'OPERATOR';
const TOKEN_PARENTHESIS = PROD ? 6 : 'PARENTHESIS';

const CHAR_CODE_0 = 48;
const CHAR_CODE_9 = 57;
const CHAR_CODE_MINUS = 45;

function hasMinus(str) {
  if (!str) {
    return false;
  }
  let code = str.charCodeAt(0);
  return code === CHAR_CODE_MINUS;
}

function mayBeNumber(str) {
  if (!str) {
    return false;
  }
  let code = str.charCodeAt(0);
  return code >= CHAR_CODE_0 && code <= CHAR_CODE_9;
}

function mayBeFloat(str) {
  if (!str) {
    return false;
  }
  return str.indexOf('.') !== -1;
}

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
   */
  constructor(condition, factName, factValue, priority, description) {
    // init
    this.condition = condition;      // human raw readable text of rule
    this.fact = factName;
    this.value = factValue;
    if (priority && priority > 0)
      this.priority = priority;
    else
      this.priority = 1;
    if (description)
      this.description = description; // detailed rule description
    else
      this.description = condition;
    this.tokens = null;              // parsed rule tokens
    this.calc = null;                // reverse polish notation for rule condition calculation
    this.error = null;               // rule`s error
    this.variables = [];             // variables list from rule

    this.validate();
    this.tokenize(condition);
    this.parse();
    this.collectVariables();
  }

  /**
   * Validate rule inputs
   */
  validate () {
    if (!this.condition) {
      this.error = ERROR_RULE_CONDITION_EMPTY;
      return;
    }
    if (!this.fact) {
      this.error = ERROR_RULE_FACT_NAME_EMPTY;
      return;
    }
    if(regexpWhiteSpaces.test(this.fact)) {
      this.error = ERROR_RULE_FACT_NAME_HAS_SPACES;
      return;
    }
    if (this.value === null || this.value === undefined) {
      this.error = ERROR_RULE_FACT_VALUE_EMPTY;
    }
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
  tokenize(raw) {
    if (this.error) {
      return;
    }
    let tokens = [];

    // preprocess
    raw = raw.replace(/<>/g, '###42@@@'); // protect <> operator from inflation to < >

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
        if (part.length) {
          str.push(part);
          let posQuoteSecond = part.indexOf("'", posQuoteFirst+1);
          if (posQuoteSecond !== -1) {
            inStr = 2;
          }
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
            let sign = 1;
            if (hasMinus(part) && part.length > 1) {
              part = part.substring(1);
              sign = -1;
            }
            if (mayBeNumber(part)) {
              if (mayBeFloat(part)) {
                part = sign*parseFloat(part);
              } else {
                part = sign*parseInt(part);
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
  parse() {
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

        case TOKEN_OPERATOR:
          let operatorCurrent = token;
          while (stack.length) {
            let operatorTop = stack[stack.length-1];
            if (
              operatorTop.type === TOKEN_OPERATOR && (
                ( operatorHasLeftAssociativity(operatorCurrent.value) && operatorPriority(operatorCurrent.value) <= operatorPriority(operatorTop.value))
                ||
                (!operatorHasLeftAssociativity(operatorCurrent.value) && operatorPriority(operatorCurrent.value) <  operatorPriority(operatorTop.value))
              )
            ) {
              output.push(operatorTop);
              stack.pop();
            } else {
              break;
            }
          }
          stack.push(operatorCurrent);
          break;

        case TOKEN_PARENTHESIS:
          if (token.value === '(') {
            stack.push(token);
          }
          if (token.value === ')') {
            let pe = false;
            while (stack.length) {
              let operatorTop = stack[stack.length-1];
              if(operatorTop.value === '(') {
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
  collectVariables() {
    if (this.error) {
      return;
    }

    this.variables = [];
    if (this.calc) {
      for (let token of this.calc) {
        if (token.type === TOKEN_VARIABLE) {
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
    if (this.calc) {
      str = this.calc.map(token => token.value).join(' ');
    }
    return str;
  }

  /**
   * Calc prepared reverse polish notation in this.calc
   * @param facts
   * @returns {boolean}
   */
  check (facts) {
    let result = false;
    let allowConsoleLog = !PROD;
    try {
      // 1) check wanted variables
      for (let variable of this.variables) {
        if (facts[variable] === undefined) {
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

          case TOKEN_VARIABLE:
            let name = token.value;
            let value = facts[name].value;
            token.value = value;
            stack.push(token);
            break;

          case TOKEN_OPERATOR:
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
              if (allowConsoleLog) {
                console.error(`rule: ${this.condition}; error: NaN detected;`);
              }
            }
            stack.push({value: result, type: TOKEN_BOOLEAN});
            break;

          default:
            // error
            return false;
        }
      }

      if (stack.length === 1) {
        result = stack[0].value;
      } else {
        // error
        this.error = `rule: ${this.condition}; error: calc failed (${stack.join(' ')})`;
        if (allowConsoleLog) {
          console.error(this.error);
        }
      }
    } catch (error) {
      this.error = `rule: ${this.condition}; error: ${error.message};`;
      if (allowConsoleLog) {
        console.error(this.error);
      }
    }

    return result;
  }
}

module.exports = {Rule}