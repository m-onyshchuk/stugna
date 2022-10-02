# Stugna
Stugna is a simple engine for expert systems building. Rules and facts can be described in JSON format, so all your 
knowledge base can be serialized into/from one JSON file.

- [Usage example](#usage-example)
- [StugnaES methods](#stugnaes-methods)
  - [constructor](#constructor)
  - [ruleAdd](#ruleadd)
  - [rulesImport](#rulesimport)
  - [rulesAll](#rulesall)
  - [rulesClear](#rulesclear)
  - [factAdd](#factadd)
  - [factsImport](#factsimport)
  - [factsAllAsArray](#factsallasarray)
  - [factsAllAsMap](#factsallasmap)
  - [factIsKnown](#factisknown)
  - [factGet](#factget)
  - [factGetPredecessorsWanted](#factgetpredecessorswanted)
  - [factGetPredecessorsUnknown](#factgetpredecessorsunknown)
  - [factsAreOrdered](#factsareordered)
  - [factsClear](#factsclear)
  - [eventsAll](#eventsall)
  - [eventsClear](#eventsclear)
- [Periodic rules](#periodic-rules)
- [ruleApply](#ruleapply)

## Usage example
To illustrate how a small expert system can function with rules and facts, we will build one in this example. 
First of all, we need to create an expert system instance:  
```js
const {StugnaES} = require("stugna-es");
let es = new StugnaES();
```
Our expert system will try to guess transport type by 2 facts - wheels count and motor presence. Next we have to add 
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
Each of these 4 rules contain mandatory fields:
* condition - a simple logic expression with operators >, <, =, <>, AND, OR, NOT and parentheses
* factName - a fact's name that will be added to the system if the condition is met. Fact names can be compared to 
  variable names. 
* factValue - fact's value to add to system in success condition case, i.e. value of variable.

Being that simple, our tiny expert system is somewhat useful already. We can ask it what knowledge (facts set) does 
it need to get info about wanted `transport` fact:
```js
let factsUnknown = es.factGetPredecessorsUnknown("transport");
console.log(factsUnknown);
// [ 'wheels', 'motor' ]
```

Next we can add missing facts to the system:
```js
let facts = [
  {
    name: "wheels",
    value: 4,
    description: "This transport has 4 wheels"
  },
  {
    name: "motor",
    value: "missing",
    description: "This transport does`t have motor"
  }
];
es.factsImport(facts);
```
Now, we can query original parent fact:
```js
let factWanted = es.factGet("transport");
console.log(factWanted);
// {
//   name: 'transport',
//   value: 'skateboard',
//   history: [ "rule: wheels = 4 AND motor = 'missing'" ],
//   changed: true
// }
```
Object `factWanted` has the following fields:
* name - fact name
* value - fact value
* history - fact history or changes reason list
* changed - whether the fact was changed by the rules 

## StugnaES methods
The methods of the StugnaES class are described below. 

### constructor
Instance creating
```js
const {StugnaES} = require("stugna-es");
let options = {
  toSaveEvents: true,
  passCountMax: 16
};
let es = new StugnaES(options);
```
* options - object with optional fields:
  * toSaveEvents - parameter to save various events about facts and rules. Default value is `true`.
  * passCountMax - parameter to limit passing by rules list. Read more in [periodic rules](#periodic-rules). 
    Default value is `16`.    

### ruleAdd
Add one rule to the system.
```js
let rule = {
  condition: "weight > 20000",
  factName: "transport",
  factValue: "bus",
  priority: 10,
  description: "Transport with weight more than 20 ton looks like a bus"
};
let isTrigger = true;
es.ruleAdd(rule, isTrigger);
```
* condition - mandatory string field to describe condition for adding new fact to system. 
  Condition is a logic expression which contains:
  * fact names. Each not reserved word without single quotes is labeled as fact name. 
  * boolean values, reserved words `TRUE` or `FALSE`
  * numbers, `integer` or `float`
  * strings. Each string must be in single quotes. All words without single quotes will be labeled as fact names.  
  * operators:
    * `>` - greater than operator returns true if the left operand is greater than the right operand, and false 
      otherwise, example: `wheels > 4`
    * `<` - less than operator returns true if the left operand is less than the right operand, and false otherwise, 
      example: `wheels < 4`
    * `=` - equality operator checks whether its two operands are equal, returning a boolean result, equality is strict, 
      example: `motor = 'present'`
    * `<>` - strict inequality operator checks whether its two operands are not equal, returning a boolean result, 
      example: `motor <> 'present'`
    * `LIKE` - operator is similar SQL LIKE operator but without wildcard support (% and _). It returns true if left 
      operand contains substring from right operand. Examples: `'lazy dog' LIKE 'dog'` return true and 
      `'lazy dog' LIKE 'fox'` returns false.  
    * `AND` - logical AND operator (logical conjunction) for a set of boolean operands will be true if and only if all 
      the operands are true. Otherwise, it will be false.
    * `OR` - logical OR operator (logical disjunction) for a set of operands is true if and only if one or more of its 
      operands is true.
    * `NOT` - logical NOT operator (logical complement, negation) takes truth to falsity and vice versa, 
      example: `NOT FALSE`
    * `+` - arithmetic addition operator for numbers and concatenation operator for strings, example with numbers: 
      `cats > dogs + 2`, example with strings: `'lazy_dog' = 'lazy' + '_' + 'dog'`   
    * `-` - arithmetic subtraction operator, example: `cats > dogs - 2`
    * `*` - multiplication arithmetic operator, example: `cats > dogs * 2`
    * `/` - division arithmetic operator, example: `cats > dogs / 2`
  * parentheses to group operators, example: `(wheels = 4 AND motor = 'present') OR weight > 1000`
  
  All reserved words (`TRUE`, `FALSE`, `AND`, `OR`, `NOT`, `LIKE`) are case sensitive. Operator precedence by group, 
  high to low:       
  * `(` `)`
  * `+` `-` `*` `/`
  * `<` `>` `=` `<>` `LIKE`
  * `AND` `OR` `NOT`
 
* factName - name of new fact, which will be added if condition is met. Field must be a string without spaces, mandatory. 
* factValue - value of new fact, which will be added if condition is met. Field can be boolean (`TRUE` or `FALSE`), 
  numerical (`integer` or `float`) or string, mandatory.
* priority - rule priority, number, optional, default value is `1`. All rules are processing by order with priority.
  Rules with small priority are processing first, with big priority - last. Order of rule processing with same priority 
  is undetermined.
* description - short fact description for logging, string, optional
* isTrigger - if true, after new rule adding, rules check procedure starts automatically to generate new possible 
  facts due to given rules in the system. Parameter is boolean, optional, default value - `true`

### rulesImport
Import array of rules to the system.
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
let isTrigger = true;
es.rulesImport(rules, isTrigger);
```
* rules - array of objects with fields like in [ruleAdd](#ruleadd) method
* isTrigger - if true, after import, rules check procedure starts automatically to generate new possible
  facts due to given rules in the system. Parameter is boolean, optional, default value - `true`

### rulesAll
Returns all known rules.
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
Cleans all rules in the system.
```js
es.rulesClear();
```

### factAdd
Add one fact to the system. If there is a fact with the same name in system it will be overwritten.
```js
let fact = { 
  name: "wheels",
  value: 2, 
  description: "Transport has 2 wheels" 
};
let isTrigger = true;
es.factAdd(fact, isTrigger);
```
* name - fact name, string, mandatory. Fact name can`t contains spaces. 
* value - fact value, numerical or string, mandatory
* description - short fact description for logging, string, optional
* isTrigger - if true, after new fact adding, rules check procedure starts automatically to generate new possible
  facts due to given rules in the system. Parameter is boolean, optional, default value - `true` 

### factsImport
Import array of facts to the system. Previous facts with same names will be overwritten.
```js
let facts = [
  {
    name: "wheels",
    value: 4,
    description: "This transport has 4 wheels"
  },
  {
    name: "motor",
    value: "missing",
    description: "This transport does`t have motor"
  }
];
let isTrigger = true;
es.factsImport(facts, isTrigger);
```
* facts - array of objects with fields like in [factAdd](#factadd) method
* isTrigger - if true, after import, rules check procedure starts automatically to generate new possible
  facts due to given rules in the system. Parameter is boolean, optional, default value - `true`

### factsAllAsArray
Returns all known facts as array.
```js
let factsArray = es.factsAllAsArray();
console.log (factsArray);
/*
[
  {
    name: 'wheels',
    value: 4,
    history: [
      'init: Transport has 2 wheels',
      'init: This transport has 4 wheels'
    ],
    changed: false
  },
  {
    name: 'motor',
    value: 'missing',
    history: [ 
      'init: This transport does`t have motor' 
    ],
    changed: false
  },
  {
    name: 'transport',
    value: 'skateboard',
    history: [ 
      'rule: Transport with 4 wheels and without engine is a skateboard' 
    ],
    changed: true
  }
]
*/
```

### factsAllAsMap
Returns all known facts as map.
```js
let factsMap = es.factsAllAsMap();
console.log (factsMap);
// { wheels: 4, motor: 'missing', transport: 'skateboard' }
```

### factIsKnown 
Is fact already known? 
```js
let name = "wheels"; 
let isKnown = es.factIsKnown(name);
console.log (isKnown);
// true
```
* name - fact name, string, mandatory
* return value - boolean

### factGet
Returns fact by the name.
```js
let name = "wheels"; 
let fact = es.factGet(name);
console.log (fact);
/*
{
  name: 'wheels',
  value: 4,
  history: [
    'init: Transport has 2 wheels',
    'init: This transport has 4 wheels'
  ],
  changed: false
}
*/
```
* name - fact name, string, mandatory
* value - fact value, number or string
* history - fact changes history by rules
* changed - whether the fact was changed by the rules

### factGetPredecessorsWanted
Returns all fact names which may be needed to determine asked fact.
```js
let name = "transport"; 
let wanted = es.factGetPredecessorsWanted(name);
console.log (wanted);
// [ 'weight', 'wheels', 'motor' ]
```
* name - fact name for which it is necessary to find predecessors, string, mandatory
* return value - array of fact names

### factGetPredecessorsUnknown
Returns fact names which are still unknown to determine asked fact.
```js
let name = "transport"; 
let unknown = es.factGetPredecessorsUnknown(name);
console.log (unknown);
// [ 'weight' ]
```
* name - fact name for which it is necessary to find predecessors, string, mandatory
* return value - array of fact names

### factsAreOrdered
Returns boolean flag - are facts ordered? Facts can be unordered only if [periodic rules](#periodic-rules) detected 
and system can`t order all facts. 
```js
let ordered = es.factsAreOrdered();
console.log (ordered);
```

### factsClear
Cleans all facts in the system.
```js
es.factsClear();
```

### eventsAll
Returns all events if logging was turned on in constructor.
```js
let events = es.eventsAll();
console.log (events);
/*
[
  {
    brief: 'rule add',
    more: 'Transport with weight more than 20 ton looks like a bus'
  },
  {
    brief: 'rule add',
    more: 'Transport with engine and 4 wheels is a car'
  },
  {
    brief: 'rule add',
    more: 'Transport with engine and 2 wheels is a motorcycle'
  },
  {
    brief: 'rule add',
    more: 'Transport with 4 wheels and without engine is a skateboard'
  },
  {
    brief: 'rule add',
    more: 'Transport with 2 wheels and without engine is a bike'
  },
  { 
    brief: 'fact add', 
    more: 'Transport has 2 wheels' 
  },
  { 
    brief: 'fact add', 
    more: 'This transport has 4 wheels' 
  },
  { 
    brief: 'fact add', 
    more: 'This transport does`t have motor' 
  },
  {
    brief: 'rule ok',
    more: 'Transport with 4 wheels and without engine is a skateboard'
  },
  { 
    brief: 'rules passed', 
    more: 'Rules pass count is 1' 
  }
]
*/
```

### eventsClear
Cleans all events in the system.
```js
es.eventsClear();
```

## Periodic rules
New facts in the system appear after passing through the list of rules. The passages stop when no new fact appears.
Sometimes a situation may arise when the system has several rules that create a periodic change in facts during one pass 
when through the list of rules.
In such a situation, an endless cycle of changing facts arises, which can only be interrupted artificially by setting 
the maximum number of passes through the list of rules. 
This parameter is called `passCountMax` and is set in the [constructor](#constructor). 
Below is an example of a periodic set of rules and the message that appears in the logs when the number of passes 
exceeds `passCountMax`.
```js
const {StugnaES} = require("stugna-es");
let options = {
  toSaveEvents: true,
  passCountMax: 2
};
let es = new StugnaES(options);

let facts = [
  {
    name: "season",
    value: "winter",
    description: "Initial value of season fact"
  }
];
es.factsImport(facts);

let rules = [
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
];
let isTrigger = true;
es.rulesImport(rules, isTrigger);

let ordered = es.factsAreOrdered();
console.log (ordered);

let events = es.eventsAll();
console.log (events);

facts = es.factsAllAsArray();
console.log (facts);

/*
false
[
  { brief: 'fact add', more: 'Initial value of season fact' },
  { brief: 'rule add', more: 'After winter comes spring' },
  { brief: 'rule add', more: 'After spring comes summer' },
  { brief: 'rule add', more: 'After summer comes autumn' },
  { brief: 'rule add', more: 'After autumn comes winter' },
  { brief: 'rule ok', more: 'After winter comes spring' },
  { brief: 'rule ok', more: 'After spring comes summer' },
  { brief: 'rule ok', more: 'After summer comes autumn' },
  { brief: 'rule ok', more: 'After autumn comes winter' },
  { brief: 'rules passed', more: 'Rules pass count is 1' },
  { brief: 'rule ok', more: 'After winter comes spring' },
  { brief: 'rule ok', more: 'After spring comes summer' },
  { brief: 'rule ok', more: 'After summer comes autumn' },
  { brief: 'rule ok', more: 'After autumn comes winter' },
  { brief: 'rules passed', more: 'Rules pass count is 2' },
  { brief: 'rules error', more: 'Periodic rules detected' }
]
[
  {
    name: 'season',
    value: 'winter',
    history: [
      'init: Initial value of season fact',
      'rule: After winter comes spring',
      'rule: After spring comes summer',
      'rule: After summer comes autumn',
      'rule: After autumn comes winter',
      'rule: After winter comes spring',
      'rule: After spring comes summer',
      'rule: After summer comes autumn',
      'rule: After autumn comes winter'
    ],
    changed: true
  }
]
*/
```

## ruleApply
Standalone function to check one rule with facts array. No need to create StugnaES instance. 

First example:
```js
const {ruleApply} = require("./stugna-es");
const condition = "animal = 'cat' OR animal = 'dog'";
const facts = [{name:"animal", value:"cat"}];
let [result, error] = ruleApply(condition, facts);
console.log('result=' + result);
console.log('error=' + error);
//result=true
//error=null
```
Second example:
```js
const {ruleApply} = require("./stugna-es");
const condition = "animal = 'monkey')";
const facts = [{name:"animal", value:"cat"}];
let [result, error] = ruleApply(condition, facts);
console.log('result=' + result);
console.log('error=' + error);
//result=false
//error=Parentheses mismatched (1)
```
