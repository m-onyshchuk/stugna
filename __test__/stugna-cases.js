module.exports = [

  {
    name: "Students, classroom",
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
]