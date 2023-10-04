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
   * @param factValue {number|string|null}
   * @param priority {number}
   * @param description {string}
   * @param factNameElse {string|undefined}
   * @param factValueElse {number|string|undefined}
   * @param final {number|undefined}
   * @param precondition {string|null|undefined}
   * @param missing {number|string|null}
   */
  constructor(condition,
              factName, factValue,
              priority, description,
              factNameElse, factValueElse,
              final, precondition, missing) {
    // init
    this.condition = condition;       // human raw readable text of rule
    this.precondition = precondition !== null ? precondition : undefined; // human raw readable text of precondition
    this.fact = factName;
    this.value = factValue;
    this.factElse = factNameElse !== null ? factNameElse : undefined;
    this.valueElse = factValueElse !== null ? factValueElse : undefined;
    if (priority && priority > 0)
      this.priority = priority;
    else
      this.priority = 1;
    if (description)
      this.description = description; // detailed rule description
    else
      this.description = Rule.createDescription(condition, factName, factValue, factNameElse, factValueElse);
    if (final && final >= 1 && final <= 3)
      this.final = final;
    else
      this.final = undefined;
    this.missing = missing !== null ? missing : undefined;
    this.error = null;                // rule error

    this.precalc = [];                // reverse polish notation for rule precondition calculation
    this.prevariables = [];           // variables list from precondition
    this.calc = [];                   // reverse polish notation for rule condition calculation
    this.variables = [];              // variables list from condition
    let tokens = [];                  // parsed rule tokens

    // precondition
    if (this.precondition !== undefined) {
      [tokens, this.error] = this._tokenize(this.precondition, 'Precondition');
      if (this.error === null) {
        [this.precalc, this.error] = this._parse(tokens, 'Precondition');
        if (this.error === null) {
          this.prevariables = this._collectVariables(this.precalc);
        }
      }
    }

    // condition
    if (this.error === null) {
      [tokens, this.error] = this._tokenize(condition, 'Condition');
      if (this.error === null) {
        [this.calc, this.error] = this._parse(tokens, 'Condition');
        if (this.error === null) {
          this.variables = this._collectVariables(this.calc);
        }
      }
    }
  }

  /**
   *
   * @param condition
   * @param factName
   * @param factValue
   * @param factElse
   * @param factNameElse
   * @param factValueElse
   * @returns {string}
   */
  static createDescription(condition, factName, factValue, factNameElse, factValueElse) {
    let postfix = '';
    if (factNameElse) {
      postfix = ` / {${factNameElse}: ${factValueElse}}`;
    }
    return `${condition} / {${factName}: ${factValue}}${postfix}`;
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
    return this.factElse !== null && this.factElse !== undefined;
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
   * @param errorSource {string}
   * @returns {*[][]}
   * @private
   */
  _tokenize(raw, errorSource) {
    let tokens = []
    let error = null;

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
      error = `${errorSource}: ${ERROR_RULE_STRING_NO_QUOTE}`;
      return [tokens, error];
    }

    tokens = this.checkUnaryMinus(tokens);

    return [tokens, error];
  }

  /**
   * Shunting yard algorithm - converting infix notation to reverse polish notation
   * https://en.wikipedia.org/wiki/Shunting_yard_algorithm
   *
   * @param tokens {*[]}
   * @param errorSource {string}
   * @returns {*[][]|(*[]|string)[]}
   * @private
   */
  _parse(tokens, errorSource) {
    let error = null;
    let output = [];
    let stack = [];
    for (let token of tokens) {
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
              error = `${errorSource}: ${ERROR_RULE_PARENTHESES_1}`;
              return [[], error];
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
        error = `${errorSource}: ${ERROR_RULE_PARENTHESES_2}`;
        return [[], error];
      }
      output.push(operatorTop);
      stack.pop();
    }

    return [output, null];
  }

  /**
   * Collect variable names from parsed reverse polish notation
   */
  _collectVariables(calc) {
    let variables = [];
    for (let token of calc) {
      if (token.type === TOKEN_VARIABLE) {
        let exist = variables.includes(token.value);
        if (!exist) {
          variables.push(token.value);
        }
      }
    }
    return variables;
  }

  /**
   * Get parsing error
   */
  getError() {
    return this.error;
  }

  /**
   * Has rule precondition?
   * @returns {boolean}
   */
  hasPrecondition() {
    return this.precalc.length > 0;
  }

  /**
   * Get prepared reverse polish notation from this.precalc
   * @returns {string}
   */
  getPreconditionCalcString() {
    let str = '';
    str = this.precalc.map(token => token.value).join(' ');
    return str;
  }

  /**
   * Get prepared reverse polish notation from this.calc
   * @returns {string}
   */
  getConditionCalcString() {
    let str = '';
    str = this.calc.map(token => token.value).join(' ');
    return str;
  }

  /**
   * @param variables
   * @param factsExisting
   * @param factsMissing
   */
  checkWantedVariables(variables, factsExisting, factsMissing) {
    let result = true;
    for (let variable of variables) {
      if (factsExisting[variable] === undefined) {
        factsMissing.push(variable);
        result = false; // rule variable is absent
      }
    }
    return result;
  }

  /**
   * Calc prepared reverse polish notation in calc
   * @param facts
   * @param calc
   * @param isPrecondition
   * @returns {boolean}
   */
  check (facts, calc, isPrecondition) {
    let result = false;
    // let allowConsoleLog = !PROD;
    try {
      // calc reverse polish notation
      let stack = [];
      for (let item of calc) {
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
        let conditionStr = isPrecondition ? this.precondition : this.condition;
        this.error = `rule: ${conditionStr}; error: calc failed (${JSON.stringify(stack)})`;
        // if (allowConsoleLog) {
        //   console.error(this.error);
        // }
      }
    } catch (error) {
      let conditionStr = isPrecondition ? this.precondition : this.condition;
      this.error = `rule: ${conditionStr}; error in condition`;
      // if (allowConsoleLog) {
      //   this.error = `rule: ${this.condition}; error: ${error.message};`;
      //   console.error(this.error);
      // }
    }

    return result;
  }
}

module.exports = {Rule}