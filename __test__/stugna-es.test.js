'use strict';
const {StugnaES} = require("../stugna-es");
const cases = require('./stugna-es-cases');

describe('StugnaES tests', () => {
  for (let item of cases) {
    test(item.name, () => {
      let es = new StugnaES();
      es.rulesImport(item.input.rules);
      es.factsImport(item.input.facts);
      let factsAll = es.factsAllAsMap();
      for (let factName in item.expected.facts) {
        let factExpected = item.expected.facts[factName];
        expect(factExpected.value).toEqual(factsAll[factName]);
        let predecessors = es.factGetPredecessorsWanted(factName).sort();
        expect(predecessors).toEqual(factExpected.predecessors.sort());
      }
    });
  }
})
