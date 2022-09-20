'use strict';
const OPERATORS = {
  '(' :   {priority: 3, arg_count: 2, left_associativity: 1},
  ')' :   {priority: 3, arg_count: 2, left_associativity: 1},
  '<' :   {priority: 2, arg_count: 2, left_associativity: 1},
  '>' :   {priority: 2, arg_count: 2, left_associativity: 1},
  '=' :   {priority: 2, arg_count: 2, left_associativity: 1},
  '<>' :  {priority: 2, arg_count: 2, left_associativity: 1},
  'AND' : {priority: 1, arg_count: 2, left_associativity: 1},
  'OR'  : {priority: 1, arg_count: 2, left_associativity: 1},
  'NOT' : {priority: 1, arg_count: 1, left_associativity: 0}
}

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

// const TOKEN_UNKNOWN = 0;
// const TOKEN_NUMBER = 1;
// const TOKEN_STRING = 2;
// const TOKEN_VARIABLE = 3;
// const TOKEN_OPERATOR = 4;
// const TOKEN_PARENTHESIS = 5;

const TOKEN_UNKNOWN  = 'unknown';
const TOKEN_NUMBER   = 'number';
const TOKEN_STRING   = 'string';
const TOKEN_VARIABLE = 'variable';
const TOKEN_OPERATOR = 'operator';
const TOKEN_PARENTHESIS = 'parenthesis';

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
   * @param factValue {string}
   * @param priority {number}
   * @param description {string}
   */
  constructor(condition, factName, factValue, priority, description) {
    // init
    this.condition = condition;     // human raw readable text of rule
    this.fact = factName;
    this.value = factValue;
    this.priority = priority;
    this.description = description; // detailed rule description

    this.tokens = null;             // parsed rule tokens
    this.calc = null;               // reverse polish notation for rule condition calculation
    this.error = null;              // rule`s error
    this.vars = [];                 // variables list from rule

    this.validate();
    this.tokenize(condition);
    this.parse();
    this.collectVariables();
  }

  /**
   */
  validate () {
    if (!this.condition) {
      this.error = 'rule condition can`t be empty';
      return;
    }
    if (!this.fact) {
      this.error = 'fact name can`t be empty';
      return;
    }
    if (!this.value) {
      this.error = 'fact value can`t be empty';
      return;
    }
    if (!Number.isInteger(this.priority)) {
      this.error = 'rule priority must be a number';
      return;
    }
    if (this.priority < 1) {
      this.error = 'rule priority must be a positive number';
      return;
    }
    if (!this.description) {
      this.error = 'rule description can`t be empty';
      return;
    }
  }

  /**
   * @param raw {string}
   */
  tokenize(raw) {
    if (this.error) {
      return;
    }
    let tokens = [];

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
              type = TOKEN_VARIABLE;
            }
          }
          tokens.push({name:part, type});
        }
      }

      if (inStr > 1) { // string end
        str = str.join(' ');
        str = str.replace(/'/g, '');
        tokens.push({name:str, type: TOKEN_STRING});
        str = [];
        inStr = 0;
      }
    }

    if (inStr) {
      this.error = "there is no ' to close string value";
      return;
    }

    this.tokens = tokens;
  }

  parse() {
    if (this.error) {
      return;
    }

    let output = [];
    let stack = [];
    for (let token of this.tokens) {
      switch (token.type) {
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
                ( operatorHasLeftAssociativity(operatorCurrent.name) && operatorPriority(operatorCurrent.name) <= operatorPriority(operatorTop.name))
                ||
                (!operatorHasLeftAssociativity(operatorCurrent.name) && operatorPriority(operatorCurrent.name) <  operatorPriority(operatorTop.name))
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
          if (token.name === '(') {
            stack.push(token);
          }
          if (token.name === ')') {
            let pe = false;
            while (stack.length) {
              let operatorTop = stack[stack.length-1];
              if(operatorTop.name === '(') {
                pe = true;
                break;
              } else {
                output.push(operatorTop);
                stack.pop();
              }
            }
            if (!pe) {
              this.error = "parentheses mismatched (1)";
              return;
            }
            stack.pop();
          }
          break;
      }
    }

    while(stack.length) {
      let operatorTop = stack[stack.length-1];
      if(operatorTop.name === '(' || operatorTop.name === ')') {
        this.error = "parentheses mismatched (2)";
        return;
      }
      output.push(operatorTop);
      stack.pop();
    }

    this.calc = output;
  }

  collectVariables() {
    if (this.error) {
      return;
    }

    this.vars = [];
    if (this.calc) {
      for (let token of this.calc) {
        if (token.type === TOKEN_VARIABLE) {
          this.vars.push(token.name);
        }
      }
    }
  }

  getError() {
    return this.error;
  }

  getCalcString() {
    let str = '';
    if (this.calc) {
      str = this.calc.map(token => token.name).join(' ');
    }
    return str;
  }
}

module.exports = {Rule}