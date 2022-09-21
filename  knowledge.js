'use strict';
const {Fact} = require("./fact");
const {Rule} = require("./rule");

/**
 *
 */
class Knowledge {

  /**
   *
   */
  constructor() {
    this.rules = [];
    this.facts = {};
    this.events = [];
  }

  /**
   * @param name {string}
   * @param value {number|string}
   * @param description {string}
   * @returns {null}
   */
  factAdd({name, value, description}) {
    let fact = new Fact(name, value, description);
    this.facts[name] = fact;
    return this.regularize();
  }

  /**
   * @param name
   * @returns {{name, history: (*|string[]|[string]|History), value: *}|null}
   */
  factGet(name) {
    if (!this.facts[name]) {
      return null;
    }
    let value = this.facts[name].value;
    let history = this.facts[name].history;
    return {name, value, history};
  }

  /**
   * @returns {{name: string, value: (number|string), history: string[]}[]}
   */
  factsAll() {
    return Object.values(this.facts);
  }

  /**
   * @param condition {string}
   * @param factName {string}
   * @param factValue {string}
   * @param priority {number}
   * @param description {string}
   */
  ruleAdd({condition, factName, factValue, priority, description}) {
    let rule = new Rule(condition, factName, factValue, priority, description);
    this.rules.push(rule);
    this.rules.sort((a,b) => {return b.priority - a.priority }); // by priority ASC
    return this.regularize();
  }

  /**
   *
   * @returns {null}
   */
  regularize () {
    let error = null;
    let passCount = 0;
    while (true) {
      let factsChanged = 0;
      for (let rule of this.rules) {
        if (rule.check(this.facts)) {
          let fact = new Fact(rule.fact, rule.value, rule.description);
          this.facts[rule.fact] = fact;
          this.events.push(rule.description);
          factsChanged++;
        }
      }
      if (!factsChanged) {
        break;
      }
      passCount++;
      if (passCount > 10) {
        error = 'ERROR: periodic rules detected';
        this.events.push(error);
        break;
      }
    }

    return null;
  }
}

module.exports = {Knowledge}