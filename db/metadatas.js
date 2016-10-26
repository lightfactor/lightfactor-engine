
var indexes = [
  {
    "unique": true,
    "key": {
      "aaid": 1,
      "upv": 1
    },
    "name": "aaid_1_upv_1"
  }
];

var objects = [
  {
    "aaid" : "FFFF#0001",
    "attestationRootCertificates" : [
      "MIIBjzCCATagAwIBAgIJAO3EGWzNemBuMAkGByqGSM49BAEwJTEjMCEGA1UEAwwaRklETyBDT05GT1JNQU5DRSBURVNUIFJPT1QwHhcNMTUwNzAxMDAxMDEyWhcNMjAwNjMwMDAxMDEyWjAlMSMwIQYDVQQDDBpGSURPIENPTkZPUk1BTkNFIFRFU1QgUk9PVDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABAw/AzVf2Ouea0fH6lFfcOaEJBgb2SEWolDWr6Vu8GPzBys2aXNiLHEyXXhBwZxCeQtL0/TxIIK4T+fCrmSBQ2ajUDBOMB0GA1UdDgQWBBRgK16UkpoMNsVnle/eGoVyME2PRzAfBgNVHSMEGDAWgBRgK16UkpoMNsVnle/eGoVyME2PRzAMBgNVHRMEBTADAQH/MAkGByqGSM49BAEDSAAwRQIhAIs0eryBXQUU4xpMHzLvN4yJSnHmtHOqMYrvfeiMUwk4AiBZdER9gUNbRrhJOMIt22UXm0dTQL22LNWJ22d6mHbGBg=="
    ],
    "description" : "FIDO ALLIANCE CONFORMANCE TEST TOOL FFFF#0001",
    "authenticatorVersion" : 1,
    "userVerificationDetails" : [
      [
        {
            "userVerification" : 4
        }
      ],
      [
        {
            "userVerification" : 2
        }
      ]
    ],
    "attachmentHint" : 1,
    "keyProtection" : 1,
    "matcherProtection" : 1,
    "tcDisplay" : 1,
    "tcDisplayContentType" : "text/plain",
    "isSecondFactorOnly" : false,
    "icon" : "data:image/png;base64,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",
    "assertionScheme" : "UAFV1TLV",
    "authenticationAlgorithm" : 1,
    "publicKeyAlgAndEncoding" : 256,
    "attestationTypes" : [
      15879
    ],
    "upv" : [
      {
        "major" : 1,
        "minor" : 0
      }
    ],
    "tcDisplayPNGCharacteristics" : [
      {
        "width" : 200,
        "height" : 400,
        "bitDepth" : 1,
        "colorType" : 3,
        "compression" : 0,
        "filter" : 0,
        "interlace" : 0,
        "plte" : [
          {
            "r" : 200,
            "g" : 0,
            "b" : 0
          },
          {
            "r" : 216,
            "g" : 216,
            "b" : 216
          }
        ]
      },
      {
        "width" : 300,
        "height" : 500,
        "bitDepth" : 8,
        "colorType" : 6,
        "compression" : 0,
        "filter" : 0,
        "interlace" : 0
      }
    ]
  }
];

module.exports = {
  indexes: indexes,
  objects: objects
}
