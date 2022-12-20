'use strict';

/**
 *
 */
class Fact {

  /**
   *
   * @param name {string}
   * @param value {boolean|number|string}
   * @param description {string}
   */
  constructor(name, value, description) {
    // name
    this.name = name;

    // value
    if (typeof value === 'string' && value.length > 1) {
      value = value.replace(/'/g, '');
      if (value === 'TRUE') {
        value = true;
      }
      if (value === 'FALSE') {
        value = false;
      }
    }
    this.value = value;

    // etc
    this.history = [description];
    this.changed = false; // false - init fact value; true - fact value changed by rules
  }
}

module.exports = {Fact}