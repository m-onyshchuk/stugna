# Stugna
Stugna is a simple engine for expert systems building. Rules and facts can be described in JSON format, so all your 
knowledge base can be serialized into/from one JSON file.

## Usage example
In this example we will create a tiny expert system to demonstrate work with rules and facts. First of all we need 
to create expert system instance:  
```js
const {StugnaES} = require("stugna-es");
let es = new StugnaES();
```
Our expert system will try to guess transport type by 2 fact - wheels count and motor presence. Next we have to add 
some rules to our system:
```js
let rules = [
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
];
es.rulesImport(rules);
```
Each of rules contains 3 mandatory field:
* condition - a simple logic expression with operators >, <, =, <>, AND, OR, NOT and parentheses
* factName - a name of fact which will be added to system if condition will be true. You can think about fact name as variable`s name. 
* factValue - value of fact to add to system in success condition case, i.e. value of variable.

Our expert system already can do some useful. We can ask it what knowledge (facts set) does it need to get info about 
wanted `transport` fact:
```js
let factsUnknown = es.factGetPredecessorsUnknown(`transport`);
console.log(factsUnknown);
// [ 'wheels', 'motor' ]
```

Next we need to add wanted facts to system:
```js
let facts = [
  {
    name: "wheels",
    value: 4,
    description: "This transport has 2 wheels"
  },
  {
    name: "motor",
    value: "missing",
    description: "This transport does`t have motor"
  }
];
es.factsImport(facts);
```
Ok, now we can try to ask wanted fact:
```js
let factWanted = es.factGetValue(`transport`);
console.log(factWanted);
// {
//   name: 'transport',
//   value: 'skateboard',
//   history: [ "rule: wheels = 4 AND motor = 'missing'" ]
// }
```
Object `factWanted` have some fields:
* name - fact name
* value - fact value
* history - fact history or changes reason list 

## API details 
