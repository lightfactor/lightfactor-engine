
var indexes = [
  {
    "unique": true,
    "key": {
      "appID": 1
    },
    "name": "appID_1"
  }
];

var objects = [
  {
    "appID" : "https://localhost.lightfactor.test/",
    "trustedFacets" : [
        {
            "version" : {
                "major" : 1,
                "minor" : 0
            },
            "ids" : [
                "https://localhost.lightfactor.test/",
                "ios:bundle-id:org.fidoalliance.ios.conformance",
                "android:apk-key-hash:SvYZ4Sgas9T2+6DpNj566iscuns"
            ]
        }
    ]
  }
];

module.exports = {
  indexes: indexes,
  objects: objects
}
