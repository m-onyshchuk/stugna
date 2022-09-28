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
  // private fields
  #rules;
  #facts;
  #events;
  #toSaveEvents;
  #passCountMax;
  #factsAreOrdered;

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
    this.#rules = [];
    this.#facts = {};
    this.#events = [];
    this.#toSaveEvents = toSaveEvents;
    this.#passCountMax = passCountMax;
    this.#factsAreOrdered = true;
  };

  /**
   * @param brief {string}
   * @param more {string}
   */
  eventAdd(brief, more) {
    if (this.#toSaveEvents) {
      this.#events.push({brief, more});
    }
  }

  /**
   *
   */
  eventsAll() {
    return this.#events.map(event => event);
  }

  /**
   *
   */
  eventsClear() {
    this.#events = [];
  }

  /**
   * @param name {string}
   * @param value {boolean|number|string}
   * @param description {string}
   * @param toRegularize {boolean}
   */
  factAdd({name, value, description}, isTrigger = true) {
    if (regexpWhiteSpaces.test(name)) {
      this.eventAdd('fact fail', ERROR_STUGNA_SPACE_IN_FACT_NAME + name);
      return;
    }
    let factNew = new Fact(name, value, `init: ${description}`);
    let factOld = this.#facts[name];
    if (factOld) {
      factOld.history.push(`init: ${description}`);
      factNew.history = factOld.history;
    }
    this.#facts[name] = factNew;
    this.eventAdd('fact add', description);
    if (isTrigger) {
      this.order();
    }
  }

  /**
   * @param name
   * @returns {boolean}
   */
  factIsKnown(name) {
    return (this.#facts[name] !== undefined)
  }

  /**
   * @param name {string}
   * @returns {{name, value: *, history: (*|string[]|[string]|History), changed}|null}
   */
  factGet(name) {
    if (!this.#facts[name]) {
      return null;
    }
    let value = this.#facts[name].value;
    let history = this.#facts[name].history;
    let changed = this.#facts[name].changed;
    return {name, value, history, changed};
  }

  /**
   * @param name {string}
   * @returns {string[]}
   */
  factGetPredecessorsWanted(name) {
    let predecessors = [];
    for (let rule of this.#rules) {
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
      if (this.#facts[fact] === undefined) {
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
      this.order();
    }
  }

  /**
   * @returns {{name: string, value: (number|string), history: string[], changed: boolean}[]}
   */
  factsAllAsArray() {
    return Object.values(this.#facts).map(fact => { return {
      name: fact.name,
      value: fact.value,
      history: fact.history,
      changed: fact.changed
    } });
  }

  /**
   */
  factsAllAsMap() {
    let facts = {};
    for (let name in this.#facts) {
      facts[name] = this.#facts[name].value;
    }
    return facts;
  }

  /**
   * @returns {boolean}
   */
  factsAreOrdered () {
    return this.#factsAreOrdered;
  }

  /**
   *
   */
  factsClear() {
    this.#facts = {};
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
      this.#rules.push(rule);
      this.#rules.sort((a, b) => {
        return b.priority - a.priority
      }); // by priority ASC
      this.eventAdd('rule add', description);
      if (isTrigger) {
        this.order();
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
      this.order();
    }
  }

  /**
   *
   */
  rulesAll() {
    return this.#rules.map(rule => { return {
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
    this.#rules = [];
    this.eventAdd('rules clear', 'all rules are cleaned');
  }

  /**
   * Regularize all rules and facts
   */
  order () {
    this.#factsAreOrdered = false;
    let passCount = 1;
    while (true) {
      // one pass - check all rules
      let factsChanged = 0;
      for (let rule of this.#rules) {
        if (rule.check(this.#facts)) {
          let factNew = new Fact(rule.fact, rule.value, `rule: ${rule.description}`);
          let factOld = this.#facts[rule.fact];
          if (factOld) {
            if (factOld.value === factNew.value) {
              continue; // there are no changes
            }
            factOld.history.push(`rule: ${rule.description}`);
            factNew.history = factOld.history;
          }
          factNew.changed = true;
          this.#facts[rule.fact] = factNew;
          this.eventAdd('rule ok', rule.description);
          factsChanged++;
        }
      }
      
      if (!factsChanged) {
        this.#factsAreOrdered = true;
        break;
      }
        
      this.eventAdd('rules passed', `Rules pass count is ${passCount}`);

      // check pass count
      passCount++;
      if (passCount > this.#passCountMax) {
        if (this.#toSaveEvents) {
          this.eventAdd('rules error', ERROR_STUGNA_PERIODIC_RULES);
        }
        this.#factsAreOrdered = false;
        break;
      }
    }
  }
}

module.exports = {StugnaES}