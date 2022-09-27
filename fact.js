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
    // init
    this.name = name;
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
    if (!description) {
      description = 'fact created (1)';
    }
    this.history = [description];
  }
}

module.exports = {Fact}