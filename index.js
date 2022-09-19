'use strict';

/**
 *
 */
class Fact {

  /**
   *
   * @param name {string}
   * @param value {number|string}
   */
  constructor(name, value) {
    // init
    this.name = name;
    this.value = value
    this.log = ["Created"];
  }
}

/**
 *
 */
class Rule {

  /**
   *
   * @param condition {string}
   * @param fact {string}
   * @param value {string}
   * @param description {string}
   */
  constructor(condition, fact, value, description) {
    // init
    this.condition = condition;     // human raw readable text of rule
    this.description = description; // detailed rule description
    this.tree = null;               // parsed rule tree
    this.vars = [];                 // variables list from rule

    this.parse();
  }

  parse() {

  }

  isValid() {
    return this.tree !== null;
  }
}