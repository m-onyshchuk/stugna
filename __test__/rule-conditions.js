module.exports = [
  {
    rule: "42",
    calc: "42",
    error: null,
  },
  {
    rule: "36.6",
    calc: "36.6",
    error: null,
  },
  {
    rule: "'horse'",
    calc: "horse",
    error: null,
  },
  {
    rule: "'horse",
    calc: "",
    error: "there is no ' to close string value",
  },
  {
    rule: "'white horse'",
    calc: "white horse",
    error: null,
  },
  {
    rule: "var1",
    calc: "var1",
    error: null,
  },
  {
    rule: "elephants > 42",
    calc: "elephants 42 >",
    error: null,
  },
  {
    rule: "sky = 'light blue'",
    calc: "sky light blue =",
    error: null,
  },
  {
    rule: "animal = 'monkey' AND count = 3",
    calc: "animal monkey = count 3 = AND",
    error: null,
  },
]