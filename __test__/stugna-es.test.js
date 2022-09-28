'use strict';
const {StugnaES} = require("../stugna-es");
const {
  ERROR_STUGNA_PERIODIC_RULES
} = require('../errors-stugna-es');

const cases = [
  {
    name: "Students in the classroom",
    input: {
      rules: [
        {
          condition: "students > 17",
          factName: "classroom",
          factValue: "full",
          priority: 100,
          description: "There are a lot of students in the classroom"
        }
      ],
      facts: [
        {
          name: "students",
          value: 10,
          description: "A few students came"
        },
        {
          name: "students",
          value: 18,
          description: "A lot of students came"
        }
      ]
    },
    expected: {
      facts: {
        classroom: {
          value: "full",
          predecessors: ["students"]
        }
      }
    }
  },

  {
    name: "What transport am I thinking of?",
    input: {
      rules: [
        {
          condition: "wheels = 4 AND motor = 'present'",
          factName: "transport",
          factValue: "car"
        },
        {
          condition: "wheels = 2 AND motor = 'present'",
          factName: "transport",
          factValue: "motorcycle"
        },
        {
          condition: "wheels = 4 AND motor = 'missing'",
          factName: "transport",
          factValue: "skateboard"
        },
        {
          condition: "wheels = 2 AND motor = 'missing'",
          factName: "transport",
          factValue: "bike"
        }
      ],
      facts: [
        {
          name: "wheels",
          value: 2,
          description: "This transport has 2 wheels"
        },
        {
          name: "motor",
          value: "missing",
          description: "This transport does`t have motor"
        }
      ]
    },
    expected: {
      facts: {
        transport: {
          value: "bike",
          predecessors: ["wheels", "motor"]
        }
      }
    }
  },

  {
    name: "Periodic rules",
    input: {
      rules: [
        {
          condition: "season = 'winter'",
          factName: "season",
          factValue: "spring",
          description: "After winter comes spring"
        },
        {
          condition: "season = 'spring'",
          factName: "season",
          factValue: "summer",
          description: "After spring comes summer"
        },
        {
          condition: "season = 'summer'",
          factName: "season",
          factValue: "autumn",
          description: "After summer comes autumn"
        },
        {
          condition: "season = 'autumn'",
          factName: "season",
          factValue: "winter",
          description: "After autumn comes winter"
        },
      ],
      facts: [
        {
          name: "season",
          value: "winter",
          description: "Initial value of season fact"
        }
      ]
    },
    expected: {
      eventLast: {
        brief: 'rules error',
        more: ERROR_STUGNA_PERIODIC_RULES
      }
    }
  }
]

describe('StugnaES tests', () => {
  for (let item of cases) {
    test(`expert system: ${item.name}`, () => {
      let es = new StugnaES();
      es.rulesImport(item.input.rules);
      es.factsImport(item.input.facts);

      // test new facts
      if (item.expected.facts) {
        let factsAll = es.factsAllAsMap();
        for (let factName in item.expected.facts) {
          let factExpected = item.expected.facts[factName];
          expect(factExpected.value).toEqual(factsAll[factName]);
          let predecessors = es.factGetPredecessorsWanted(factName).sort();
          expect(factExpected.predecessors.sort()).toEqual(predecessors);
        }
      }

      // test last event
      if (item.expected.eventLast) {
        let events = es.eventsAll();
        let last = events[events.length - 1];
        expect(item.expected.eventLast.brief).toEqual(last.brief);
        expect(item.expected.eventLast.more).toEqual(last.more);
      }
    });
  }
})
