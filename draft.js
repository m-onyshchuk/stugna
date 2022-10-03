'use strict';
const {StugnaES} = require("./stugna-es");
/**
 * This is a work draft file for local tests
 */

let es = new StugnaES({toSaveEvents: false});
let rulesInput = [{},{},{},{},{},{},{},{},{},{},{},{},{}];
es.rulesImport(rulesInput);
let rulesOutput = es.rulesAll();
console.log(rulesOutput);
