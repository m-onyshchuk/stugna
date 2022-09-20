'use strict';
/**
 *
 */
class Fact {

  /**
   *
   * @param name {string}
   * @param value {number|string}
   * @param description {string}
   */
  constructor(name, value, description) {
    // init
    this.name = name;
    this.value = value
    this.log = [description];
  }
}

module.exports = {Fact}