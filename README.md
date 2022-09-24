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
Object `factWanted` has some fields:
* name - fact name
* value - fact value
* history - fact history or changes reason list 

## API details 
The methods of the StugnaES class are described below. 

### constructor
Instance creating
```js
const {StugnaES} = require("stugna-es");
let toSaveEvents = true;
let es = new StugnaES(toSaveEvents);
```
* toSaveEvents - parameter to save various events about facts and rules. Default value is true.  

### ruleAdd
Add one rule to system.
```js
let rule = {
  condition: "weight > 20000",
  factName: "transport",
  factValue: "bus",
  priority: 10,
  description: "Transport with weight more than 20 ton looks like a bus"
};
let toRegularize = true;
es.ruleAdd(rule, toRegularize);
```
* condition - mandatory string field to describe condition for adding new fact to system. 
  Condition is a logic expression, can contains:
  * numbers, integer or floats
  * strings. Each string must be in single quotes
  * operators:
    * `>` - greater than operator returns true if the left operand is greater than the right operand, and false otherwise, example: `wheels > 4`
    * `<` - less than operator returns true if the left operand is less than the right operand, and false otherwise, example: `wheels < 4`
    * `=` - equality operator checks whether its two operands are equal, returning a boolean result, equality is strict, example: `motor = 'present'`
    * `<>` - strict inequality operator checks whether its two operands are not equal, returning a boolean result, example: `motor <> 'present'`
    * `AND` - logical AND operator (logical conjunction) for a set of boolean operands will be true if and only if all the operands are true. Otherwise it will be false.
    * `OR` - logical OR operator (logical disjunction) for a set of operands is true if and only if one or more of its operands is true.
    * `NOT` - logical NOT operator (logical complement, negation) takes truth to falsity and vice versa.
  * parentheses to group operators, example: `(wheels = 4 AND motor = 'present') OR weight > 1000`
* factName - name of new fact, which will be added if condition will be true. Field must be string, mandatory. 
* factValue - value of new fact, which will be added if condition will be true. Field can be number (integer or float) 
  or string, mandatory.
* priority - rule`s priority, number, optional, default value is 1. All rules are processing by order with priority.
  Rules with small priority are processing first, with big priority - last. Order of rule processing with same priority 
  is undetermined.
* description - short fact description for log, string, optional
* toRegularize - parameter to regularize all rules and facts, boolean, optional, default value - true

### rulesImport
Import set (array) of rules to system
```js
let rules = [
  {
    condition: "wheels = 4 AND motor = 'present'",
    factName: "transport",
    factValue: "car",
    priority: 10,
    description: "Transport with engine and 4 wheels is a car"
  },
  {
    condition: "wheels = 2 AND motor = 'present'",
    factName: "transport",
    factValue: "motorcycle",
    priority: 10,
    description: "Transport with engine and 2 wheels is a motorcycle"
  },
  {
    condition: "wheels = 4 AND motor = 'missing'",
    factName: "transport",
    factValue: "skateboard",
    priority: 10,
    description: "Transport with 4 wheels and without engine is a skateboard"
  },
  {
    condition: "wheels = 2 AND motor = 'missing'",
    factName: "transport",
    factValue: "bike",
    priority: 10,
    description: "Transport with 2 wheels and without engine is a bike"
  }
];
let toRegularize = true;
es.rulesImport(rules, toRegularize);
```
* rules - array of objects with fields like in `ruleAdd` method
* toRegularize - parameter to regularize all rules and facts, boolean, optional, default value - true

### rulesAll
Method returns all known rules
```js
let rulesAll = es.rulesAll();
console.log (rulesAll);
/*
[
  {
    condition: 'weight > 20000',
    factName: 'transport',
    valueValue: 'transport',
    priority: 10,
    description: 'Transport with weight more than 20 ton looks like a bus'
  },
  {
    condition: "wheels = 4 AND motor = 'present'",
    factName: 'transport',
    valueValue: 'transport',
    priority: 10,
    description: 'Transport with engine and 4 wheels is a car'
  },
  {
    condition: "wheels = 2 AND motor = 'present'",
    factName: 'transport',
    valueValue: 'transport',
    priority: 10,
    description: 'Transport with engine and 2 wheels is a motorcycle'
  },
  {
    condition: "wheels = 4 AND motor = 'missing'",
    factName: 'transport',
    valueValue: 'transport',
    priority: 10,
    description: 'Transport with 4 wheels and without engine is a skateboard'
  },
  {
    condition: "wheels = 2 AND motor = 'missing'",
    factName: 'transport',
    valueValue: 'transport',
    priority: 10,
    description: 'Transport with 2 wheels and without engine is a bike'
  }
]
*/
```

### rulesClear
Method cleans all rules in system
```js
es.rulesClear();
```

### factAdd
Add one fact to system.
```js
let fact = { 
  name: 'wheels', 
  value: 4, 
  description: 'Transport has 4 wheels' 
};
let toRegularize = true;
es.factAdd(fact, toRegularize);
```
* name - fact name, string, mandatory
* value - fact value, number or string, mandatory
* description - short fact description for log, string, optional
* toRegularize - parameter to regularize all rules and facts, boolean, optional, default value - true 

### factsImport
Import set (array) of facts to system
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
let toRegularize = true;
es.factsImport(facts, toRegularize);
```
* facts - array of objects with fields like in `factAdd` method
* toRegularize - parameter to regularize all rules and facts, boolean, optional, default value - true

### factIsKnown 
Is fact already known? 
```js
let name = 'wheels'; 
let isKnown = es.factIsKnown(name);
console.log (isKnown);
// true
```
* name - fact name, string, mandatory
* return value - boolean

### factGetValue
Ask value of fact.
```js
let name = 'wheels'; 
let value = es.factGetValue(name);
console.log (value);
// 4
```
* name - fact name, string, mandatory
* return value - fact value, number, string or null for unknown facts 

### factGetPredecessorsWanted
Ask all fact names which may be need to determine asked fact.
```js
let name = 'transport'; 
let wanted = es.factGetPredecessorsWanted(name);
console.log (wanted);
// [ 'weight', 'wheels', 'motor' ]
```
* name - fact name for which it is necessary to find predecessors, string, mandatory
* return value - array of fact names

### factGetPredecessorsUnknown
Ask fact names which are still unknown to determine asked fact.
```js
let name = 'transport'; 
let unknown = es.factGetPredecessorsUnknown(name);
console.log (unknown);
// [ 'weight' ]
```
* name - fact name for which it is necessary to find predecessors, string, mandatory
* return value - array of fact names
