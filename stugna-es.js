'use strict';
const {Fact} = require("./fact");
const {Rule} = require("./rule");
const {
  ERROR_STUGNA_SPACE_IN_FACT_NAME,
  ERROR_STUGNA_PERIODIC_RULES
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
  _passCountMax;
  _factsAreOrdered;

  /**
   * @param options {null|Object}
   */
  constructor(options = null) {
    let toSaveEvents = true;
    let passCountMax = 16;
    if (options) {
      if (options.toSaveEvents !== undefined) {
        toSaveEvents = options.toSaveEvents;
      }
      if (options.passCountMax !== undefined) {
        passCountMax = options.passCountMax;
      }
    }
    this._rules = [];
    this._facts = {};
    this._events = [];
    this._toSaveEvents = toSaveEvents;
    this._passCountMax = passCountMax;
    this._factsAreOrdered = true;
  }

  /**
   * @param brief {string}
   * @param more {string}
   */
  eventAdd(brief, more) {
    if (this._toSaveEvents) {
      this._events.push({brief, more});
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
   * @param name {string}
   * @param value {string|number|boolean}
   * @param description {string}
   * @param toRegularize {boolean}
   */
  factAdd({name, value, description}, isTrigger = true) {
    if (regexpWhiteSpaces.test(name)) {
      this.eventAdd('fact fail', ERROR_STUGNA_SPACE_IN_FACT_NAME + name);
      return;
    }
    let factNew = new Fact(name, value, `init: ${description}`);
    let factOld = this._facts[name];
    if (factOld) {
      factOld.history.push(`init: ${description}`);
      factNew.history = factOld.history;
    }
    this._facts[name] = factNew;
    this.eventAdd('fact add', description);
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
    let tail = [];
    for (let predecessor1 of predecessors) {
      let children = this.factGetPredecessorsWanted(predecessor1);
      for (let predecessor2 of children) {
        if (!tail.includes(predecessor2) && !predecessors.includes(predecessor2)) {
          tail.push(predecessor2);
        }
      }
    }
    predecessors = predecessors.concat(tail);
    return predecessors;
  }

  /**
   * @param name {string}
   * @returns {string[]}
   */
  factGetPredecessorsUnknown(name) {
    let unknown = [];
    let predecessors = this.factGetPredecessorsWanted(name);
    for (let fact of predecessors) {
      if (this._facts[fact] === undefined) {
        unknown.push(fact);
      }
    }
    return unknown;
  }

  /**
   * @param facts {Object[]}
   * @param isTrigger {boolean}
   */
  factsImport(facts, isTrigger = true) {
    for (let fact of facts) {
      if (fact.name !== undefined && fact.value !== undefined && fact.description !== undefined) {
        this.factAdd(fact, false);
      } else {
        this.eventAdd('fact skip', JSON.stringify(fact));
      }
    }
    if (isTrigger) {
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
    let rule = new Rule(condition, factName, factValue, priority, description);
    let ruleError = rule.getError();
    if (ruleError) {
      this.eventAdd('rule error', ruleError);
    } else {
      this._rules.push(rule);
      this._rules.sort((a, b) => {
        return a.priority - b.priority; // by priority ASC
      });
      this.eventAdd('rule add', description);
      if (isTrigger) {
        this._order();
      }
    }
  }

  /**
   * @param rules {object[]}
   * @param isTrigger {boolean}
   */
  rulesImport(rules, isTrigger = true) {
    for (let rule of rules) {
      if (
        rule.condition !== undefined &&
        rule.factName !== undefined &&
        rule.factValue !== undefined
      ) {
        rule.priority = rule.priority ? rule.priority : 1;
        rule.description = rule.description ? rule.description : null;
        this.ruleAdd(rule, false);
      }
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
        if (rule.check(this._facts)) {
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
          this.eventAdd('rule ok', rule.description);
          factsChanged++;
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