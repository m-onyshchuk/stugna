'use strict';
const {Fact} = require("./fact");
const {Rule} = require("./rule");

/**
 *
 */
class StugnaES {
  // private fields
  #rules;
  #facts;
  #toSaveEvents;
  #events;

  /**
   * @param toSaveEvents {boolean}
   */
  constructor(toSaveEvents = true) {
    this.#rules = [];
    this.#facts = {};
    this.#toSaveEvents = toSaveEvents;
    this.#events = [];
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
  eventAll() {
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
   * @param value {number|string}
   * @param description {string}
   * @param toRegularize {boolean}
   */
  factAdd({name, value, description}, toRegularize = true) {
    let factNew = new Fact(name, value, description);
    let factOld = this.#facts[name];
    if (factOld) {
      factOld.history.push(description);
      factNew.history = factOld.history;
    }
    this.#facts[name] = factNew;
    this.eventAdd('fact add', description);
    if (toRegularize) {
      this.regularize();
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
   * @returns {{name, history: (*|string[]|[string]|History), value: *}|null}
   */
  factGetValue(name) {
    if (!this.#facts[name]) {
      return null;
    }
    let value = this.#facts[name].value;
    let history = this.#facts[name].history;
    return {name, value, history};
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
   * @param facts {object[]}
   * @param toRegularize {boolean}
   */
  factsImport(facts, toRegularize = true) {
    for (let fact of facts) {
      if (fact.name !== undefined && fact.value !== undefined && fact.description !== undefined) {
        this.factAdd(fact, false);
      }
    }
    if (toRegularize) {
      this.regularize();
    }
  }

  /**
   * @returns {{name: string, value: (number|string), history: string[]}[]}
   */
  factsAllAsArray() {
    return Object.values(this.#facts).map(fact => { return {name: fact.name, value: fact.value, history: fact.history} });
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
   * @param toRegularize {boolean}
   */
  ruleAdd({condition, factName, factValue, priority, description}, toRegularize = true) {
    let rule = new Rule(condition, factName, factValue, priority, description);
    this.#rules.push(rule);
    this.#rules.sort((a,b) => {return b.priority - a.priority }); // by priority ASC
    this.eventAdd('rule add', description);
    if (toRegularize) {
      this.regularize();
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
   * @param rules {object[]}
   * @param toRegularize {boolean}
   */
  rulesImport(rules, toRegularize = true) {
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
    if (toRegularize) {
      this.regularize();
    }
  }

  /**
   *
   */
  rulesClear() {
    this.#rules = [];
    this.eventAdd('rules clear', 'all rules are cleaned');
  }

  /**
   *
   */
  regularize () {
    let passCount = 0;
    while (true) {
      let factsChanged = 0;
      for (let rule of this.#rules) {
        if (rule.check(this.#facts)) {
          let factNew = new Fact(rule.fact, rule.value, rule.description);
          let factOld = this.#facts[rule.fact];
          if (factOld) {
            if (factOld.value === factNew.value) {
              continue; // there are no changes
            }
            factOld.history.push(rule.description);
            factNew.history = factOld.history;
          }
          this.#facts[rule.fact] = factNew;
          this.eventAdd('rule ok', rule.description);
          factsChanged++;
        }
      }
      if (!factsChanged) {
        break;
      }
      passCount++;
      if (passCount > 10) {
        if (this.#toSaveEvents) {
          this.#events.push('error', 'periodic rules detected');
        }
        break;
      }
    }
  }
}

module.exports = {StugnaES}