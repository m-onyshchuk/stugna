'use strict';

const {Fact} = require("./fact");
const {Rule} = require("./rule");
const {
  ERROR_FACT_NAME_ABSENT,
  ERROR_FACT_NAME_EMPTY,
  ERROR_FACT_VALUE_ABSENT,
} = require('./errors-fact');
const {
  ERROR_STUGNA_SPACE_IN_FACT_NAME,
  ERROR_STUGNA_PERIODIC_RULES,
} = require('./errors-stugna-es');

const regexpWhiteSpaces = new RegExp('\\s+', 'g');

/**
 *
 */
class StugnaES {
  // fields
  _rules;
  _facts;
  _events;
  _toSaveEvents;
  _toExplainMore;
  _passCountMax;
  _factsAreOrdered;

  /**
   * @param options {null|Object}
   */
  constructor(options = null) {
    let toSaveEvents = true;
    let toExplainMore = false;
    let passCountMax = 16;
    if (options) {
      if (options.toSaveEvents !== undefined) {
        toSaveEvents = options.toSaveEvents;
      }
      if (options.toExplainMore !== undefined) {
        toExplainMore = options.toExplainMore;
      }
      if (options.passCountMax !== undefined) {
        passCountMax = options.passCountMax;
      }
    }
    this._rules  = [];
    this._facts  = {};
    this._events = [];
    this._toSaveEvents  = toSaveEvents;
    this._toExplainMore = toExplainMore;
    this._passCountMax  = passCountMax;
    this._factsAreOrdered = true;
  }

  /**
   * @param brief {string}
   * @param more {string}
   * @param subject {string}
   */
  eventAdd(brief, more, subject) {
    if (this._toSaveEvents) {
      let event = {brief}
      if (more) {
        event.more = more;
      }
      if (subject) {
        event.subject = subject;
      }
      this._events.push(event);
    }
  }

  /**
   *
   */
  eventsAll() {
    return this._events.map(event => event);
  }

  /**
   *
   */
  eventsClear() {
    this._events = [];
  }

  /**
   * @param name {string|null|undefined}
   * @param value {string|number|boolean|null|undefined}
   * @returns {boolean}
   * @private
   */
  _factIsValid(name, value) {
    if (name === null || name === undefined) {
      this.eventAdd('fact error', ERROR_FACT_NAME_ABSENT);
      return false;
    }
    name = name.toString();
    let nameTrimmed = name.trim()
    if (nameTrimmed.length === 0) {
      this.eventAdd('fact error', ERROR_FACT_NAME_EMPTY);
      return false;
    }
    if (regexpWhiteSpaces.test(name)) {
      this.eventAdd('fact error', ERROR_STUGNA_SPACE_IN_FACT_NAME + name);
      return false;
    }
    if (value === null || value === undefined) {
      this.eventAdd('fact error', ERROR_FACT_VALUE_ABSENT);
      return false;
    }
    return true
  }

  /**
   * @param name {string|null|undefined}
   * @param value {string|number|boolean|null|undefined}
   * @param description {string|null|undefined}
   * @param toRegularize {boolean}
   */
  factAdd({name, value, description}, isTrigger = true) {
    if (!this._factIsValid(name, value)) {
      return
    }

    let subject = description;
    if (!subject) {
      subject = `${name}: ${value}`;
    }

    let factNew = new Fact(name, value, subject);
    let factOld = this._facts[name];
    if (factOld) {
      factOld.history.push(`init: ${subject}`);
      factNew.history = factOld.history;
    }
    this._facts[name] = factNew;

    this.eventAdd('fact add', null, subject);
    if (isTrigger) {
      this._order();
    }
  }

  /**
   * @param name
   * @returns {boolean}
   */
  factIsKnown(name) {
    return (this._facts[name] !== undefined)
  }

  /**
   * @param name {string}
   * @returns {{name, value: *, history: (*|string[]|[string]|History), changed}|null}
   */
  factGet(name) {
    if (!this._facts[name]) {
      return null;
    }
    let value = this._facts[name].value;
    let history = this._facts[name].history;
    let changed = this._facts[name].changed;
    return {name, value, history, changed};
  }

  /**
   * @param name {string}
   * @returns {string[]}
   */
  factGetPredecessorsWanted(name) {
    let predecessors = [];
    for (let rule of this._rules) {
      if (rule.fact === name) {
        for (let predecessor of rule.variables) {
          if (!predecessors.includes(predecessor)) {
            predecessors.push(predecessor);
          }
        }
      }
    }
    let childrenAll = []; // may contain duplicates
    for (let predecessor1 of predecessors) {
      let children = this.factGetPredecessorsWanted(predecessor1);
      childrenAll = childrenAll.concat(children);
    }
    for (let fact of childrenAll) { // filter duplicates
      if (!predecessors.includes(fact)) {
        predecessors.push(fact);
      }
    }
    return predecessors;
  }

  /**
   * @param name {string}
   * @returns {string[]}
   */
  factGetPredecessorsUnknown(name) {
    // find all wanted facts
    let wanted = this.factGetPredecessorsWanted(name);

    // exclude known facts
    let unknownWithRules = [];
    for (let fact of wanted) {
      if (this._facts[fact] === undefined) {
        unknownWithRules.push(fact);
      }
    }

    // exclude facts that can be produced by the rules
    let unknownWithoutRules = [];
    for (let fact of unknownWithRules) {
      let noRuleForFact = true;
      for (let rule of this._rules) {
        if (rule.fact === fact) {
          noRuleForFact = false;
          break;
        }
      }
      if (noRuleForFact) {
        unknownWithoutRules.push(fact);
      }
    }

    return unknownWithoutRules;
  }

  /**
   * @param facts {Object[]}
   * @param isTrigger {boolean}
   */
  factsImport(facts, isTrigger = true) {
    let addedCount = 0;
    for (let fact of facts) {
      if (!this._factIsValid(fact.name, fact.value)) {
        continue;
      }
      this.factAdd(fact, false);
      addedCount++;
    }
    if (isTrigger && addedCount > 0) {
      this._order();
    }
  }

  /**
   * @returns {{name: string, value: (number|string), history: string[], changed: boolean}[]}
   */
  factsAllAsArray() {
    return Object.values(this._facts).map(fact => { return {
      name: fact.name,
      value: fact.value,
      history: fact.history,
      changed: fact.changed
    } });
  }

  /**
   * @returns {object}
   */
  factsAllAsMap() {
    let facts = {};
    for (let name in this._facts) {
      facts[name] = this._facts[name].value;
    }
    return facts;
  }

  /**
   * @returns {boolean}
   */
  factsAreOrdered () {
    return this._factsAreOrdered;
  }

  /**
   *
   */
  factsClear() {
    this._facts = {};
    this.eventAdd('facts clear', 'all facts are cleaned');
  }

  /**
   * @param condition {string}
   * @param factName {string}
   * @param factValue {string}
   * @param priority {number}
   * @param description {string}
   * @param isTrigger {boolean}
   */
  ruleAdd({condition, factName, factValue, priority, description}, isTrigger = true) {
    let ruleError = Rule.validate(condition, factName, factValue);
    if (!description) {
      description = `${condition} / ${factName} / ${factValue}`
    }
    if (ruleError) {
      this.eventAdd('rule error', ruleError, description); // validation errors
      return;
    }

    let rule = new Rule(condition, factName, factValue, priority, description);
    ruleError = rule.getError();
    if (ruleError) {
      this.eventAdd('rule error', ruleError, description); // parsing errors
      return
    }

    this._rules.push(rule);
    this._rules.sort((a, b) => {
      return a.priority - b.priority; // by priority ASC
    });
    this.eventAdd('rule add', null, description);
    if (isTrigger) {
      this._order();
    }
  }

  /**
   * @param rules {object[]}
   * @param isTrigger {boolean}
   */
  rulesImport(rules, isTrigger = true) {
    for (let rule of rules) {
      let ruleError = Rule.validate(rule.condition, rule.factName, rule.factValue);
      let subject = rule.description;
      if (!subject) {
        subject = `${rule.condition} / ${rule.factName} / ${rule.factValue}`
      }
      if (ruleError) {
        this.eventAdd('rule error', ruleError, subject);
        continue;
      }

      rule.priority = rule.priority ? rule.priority : 1;
      this.ruleAdd(rule, false);
    }
    if (isTrigger) {
      this._order();
    }
  }

  /**
   * @returns {object[]}
   */
  rulesAll() {
    return this._rules.map(rule => { return {
      condition: rule.condition,
      factName: rule.fact,
      valueValue: rule.fact,
      priority: rule.priority,
      description: rule.description
    }});
  }

  /**
   *
   */
  rulesClear() {
    this._rules = [];
    this.eventAdd('rules clear', 'all rules are cleaned');
  }

  /**
   * Regularize all rules and facts
   */
  _order () {
    this._factsAreOrdered = false;
    let passCount = 1;
    while (passCount <= this._passCountMax) {
      // one pass - check all rules
      let factsChanged = 0;
      for (let rule of this._rules) {
        let diagnostics = {
          toExplainMore: this._toExplainMore
        };
        if (rule.check(this._facts, diagnostics)) {
          let factNew = new Fact(rule.fact, rule.value, `rule: ${rule.description}`);
          let factOld = this._facts[rule.fact];
          if (factOld) {
            if (factOld.value === factNew.value) {
              continue; // there are no changes
            }
            factOld.history.push(`rule: ${rule.description}`);
            factNew.history = factOld.history;
          }
          factNew.changed = true;
          this._facts[rule.fact] = factNew;
          this.eventAdd('rule ok', null, rule.description);
          factsChanged++;
        } else {
          if (this._toExplainMore && diagnostics.missingFact) {
            this.eventAdd('rule skip', `pass: ${passCount}; missing fact: ${diagnostics.missingFact};`, rule.description);
          }
        }
      }
      
      if (!factsChanged) {
        this._factsAreOrdered = true;
        break;
      }
        
      this.eventAdd('rules passed', `Rules pass count is ${passCount}`);
      passCount++;
    }

    if (!this._factsAreOrdered && this._toSaveEvents) {
      this.eventAdd('rules error', ERROR_STUGNA_PERIODIC_RULES);
    }
  }
}

/**
 *
 * @param condition {string}
 * @param facts {[{name: string, value: number|string}]}
 * @returns {[boolean, null|string]}
 */
function ruleApply(condition, facts) {
  let result = false;
  let error = null;

  // facts
  let factsMap = {};
  for (let fact of facts) {
    if (!fact.name) continue;
    factsMap[fact.name] = {value:fact.value};
  }

  // rule
  let rule = new Rule(condition, 'fact-name', 'fact-value', 10, 'description');
  if (rule.error) {
    error = rule.error;
  } else {
    result = rule.check(factsMap);
    if (rule.error) {
      error = rule.error;
    }
  }

  return [result, error];
}

module.exports = {StugnaES, ruleApply}