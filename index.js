'use strict';

const {Knowledge} = require("./knowledge");

let kb = new Knowledge();
kb.ruleAdd({
  condition: "students > 17",
  factName: "classroom",
  factValue: "full",
  priority: 100,
  description: "There are a lot of students in the classroom"
});

kb.factAdd({
  name: "students",
  value: 10,
  description: "A few students came"
});
let facts = kb.factsAll();
console.log('state-1: ', facts);

kb.factAdd({
  name: "students",
  value: 18,
  description: "A lot of students came"
});
facts = kb.factsAll();
console.log('state-2: ', facts);