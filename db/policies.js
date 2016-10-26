
var indexes = [
  {
    "unique": true,
    "key": {
      "name": 1
    },
    "name": "name_1"
  }
];

var objects = [
  {
    "name" : "policy0",
    "policy" : {
        "accepted" : [
            [
                {
                    "aaid" : [
                        "0039#0001"
                    ]
                }
            ],
            [
                {
                    "aaid" : [
                        "FFFF#0001"
                    ]
                }
            ]
        ]
    }
  }
];

module.exports = {
  indexes: indexes,
  objects: objects
}
