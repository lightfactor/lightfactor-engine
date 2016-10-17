
/*

    Copyright © 2016, Lightfactor, LLC.
    Created by Dave Atherton.

    This file is part of lightfactor-engine.

    lightfactor-uaf is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    lightfactor-uaf is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.

*/

var uaf = require('lightfactor-uaf');
var express = require('express');
var router = express.Router();

var dm = null;
var appID = null;

// TODO: wire up actual status codes per FIDO spec (uaf.statusCode has objects)

router.use(function(req, res, next) {
  if (!dm) dm = req.app.get('dataMongo');
  appID = `${req.protocol}://${req.hostname}/`;
  next();
});

router.post('/', function(req, res, next) {                                                 // /Get
  console.log(req.body);
  var data = {};
  var username = req.body.context.userName;                                                 // yes, FIDO conformance tool is using mixed camel case! (as of 7/13/2016)
  var transaction = req.body.context.transaction;

  function extractChallengeFromRequest(uafRequest) {

    var challenge = {
      challenge: uafRequest.challenge,                                                      // TODO: eliminate UAFRequest top-level object
      serverData: uafRequest.header.serverData,
      username: uafRequest.username,
      policy: uafRequest.policy,
      expiration: 0
    }

    if (uafRequest.transaction) challenge.transaction = uafRequest.transaction[0].content;             // TODO: handle arrays properly

    return challenge;

  }

  // NOTE: regarding fat arrows, the following are equivalent:
  //  P.then(function(data) { return doWork('text', data); }); and
  //  P.then(data => doWork('text', data));

  switch (req.body.op) {

    case "Reg":
    {                                                                       // TODO: parameterize policy
      console.log("Registration request requested.");
      dm.findOnePolicy({ name: "policy0" }, data)
        .then(data => dm.findAuthenticators({ username: username, type: "uaf" }, { "data.keyID": 1, "data.aaid": 1 }, data))
        .then(data => uaf.getRegistrationRequest(appID, data.policy, data.authenticators, username, data))
        .then(data => extractChallengeFromRequest(data.uafRequest[0]))
        .then(challenge => dm.saveChallenge(challenge, data))
        .then(data => sendRequest(res, data.uafRequest, 'Reg', data))
        .catch(next)
      ;
      break;
    }

    case "Auth":
    {
      console.log("Authentication request requested.");

      var p = dm.findOnePolicy({ name: "policy0" }, data);

      if (username != null) {
        console.log("Authenticating with username.")
        p = p
          .then(data => dm.findAuthenticators({ username: username, type: "uaf" }, { "data.aaid": 1, "data.tcDisplayPNGCharacteristics": 1, "data.keyID": 1 }, data))
          .then(data => dm.findExactlyOneMetadata({ aaid: data.authenticators[0].data.aaid, "upv.major": 1, "upv.minor": 0 }, data))
        ;
      }
      else {
        if (transaction) throw new Error("Missing username with transction mode authentication.");
        console.log("Authenticating without username.");
      }

      p
        .then(data => uaf.getAuthenticationRequest(appID, data.policy, transaction, data.authenticators, data.metadata, data))
        .then(data => extractChallengeFromRequest(data.uafRequest[0]))
        .then(challenge => dm.saveChallenge(challenge, data))
        .then(data => sendRequest(res, data.uafRequest, 'Auth', data))
        .catch(next)
      ;

      break;
    }

    case "Dereg":
    {
      console.log("Deregistration request requested.");
      dm.findAuthenticators({ username: username, type: "uaf" }, { "data.keyID": 1, "data.aaid": 1 }, data)
        .then(data => uaf.getDeregistrationRequest(appID, data.authenticators, data))
        .then(data => dm.deleteAuthenticators({ '_id': { '$in': data.authenticators.map(function(authenticator) { return authenticator._id; }) } }, data))
        .then(data => sendRequest(res, data.uafRequest, 'Dereg', data))
        .catch(next)
      ;
      break;
    }

    default:
      return next(new Error("Invalid operation selected."));

  }

});

router.post('/Reg', function(req, res, next) {                                              // /Send/Reg

  console.log("Registration response received.");

  var responses = JSON.parse(req.body.uafResponse);                                         // TODO: deal with bad req.body
  var response = responses[0];                                                              // TODO: deal with array properly

  Promise.resolve({})
    .then(data => dm.findOneTrustedFacetList({ appID: appID }, data))
    .then(data => uaf.validateAndUnwrapResponse([ "Reg" ], appID, data.trustedFacets.ids, response))
    .then(data => dm.findAndDeleteChallenge({ challenge: data.fcParams.challenge }, data))
    .then(data => dm.findExactlyOneMetadata({ aaid: data.assertionObject.assertion.TAG_UAFV1_REG_ASSERTION.TAG_UAFV1_KRD.TAG_AAID.s, "upv.major": 1, "upv.minor": 0 }, data))
    .then(data => uaf.verifyRegistrationAssertion(data.assertionObject, data.metadata, data))    // add assertion as a parameter
    .then(data => dm.saveAuthenticator({ username: data.username, type: "uaf", data: data.registrationData }, data))
    .then(data => sendStatus(res, "Registration successful.", 1200, data))
    .catch(next)
  ;

});

router.post('/Auth', function(req, res, next) {                                             // /Send/Auth

  console.log("Authentication response received.");

  var responses = JSON.parse(req.body.uafResponse);
  var response = responses[0];

  Promise.resolve({})
    .then(data => dm.findOneTrustedFacetList({ appID: appID }, data))
    .then(data => uaf.validateAndUnwrapResponse([ "Auth" ], appID, data.trustedFacets.ids, response))
    .then(data => dm.findAndDeleteChallenge({ challenge: data.fcParams.challenge }, data))
    .then(data => dm.findExactlyOneMetadata({ aaid: data.assertionObject.assertion.TAG_UAFV1_AUTH_ASSERTION.TAG_UAFV1_SIGNED_DATA.TAG_AAID.s, "upv.major": 1, "upv.minor": 0 }, data))
    .then(data => dm.findAuthenticators({ "data.keyID": data.assertionObject.assertion.TAG_UAFV1_AUTH_ASSERTION.TAG_UAFV1_SIGNED_DATA.TAG_KEYID.s, type: "uaf" }, {}, data))
    .then(data => uaf.verifyAuthenticationAssertion(data.assertionObject, data.challenge.transaction, data.authenticators[0], data.metadata, data))
    .then(data => dm.updateAuthenticator({ _id: data.authenticators[0]._id }, { '$set': { "data.signatureCounter" : data.assertionObject.assertion.TAG_UAFV1_AUTH_ASSERTION.TAG_UAFV1_SIGNED_DATA.TAG_COUNTERS.signatureCounter }}, data))
    .then(data => sendStatus(res, "Authentication successful.", 1200, data))
    .catch(next)
  ;

});


module.exports = router;

// usage:
//    .then(data => dumpObjPropertyWithMessage("Authenticators:", "authenticators", data))

function dumpObjPropertyWithMessage(message, property, obj) {
  console.log(message);
  if (property && obj[property]) console.log(`obj.${property}: ${JSON.stringify(obj[property])}`);
  else console.log(JSON.stringify(obj, null, 2));                                                                    // TODO: more robust output for properties that are undefined
  return(obj);
}

function sendRequest(res, request, op, obj) {
  var returnUAFRequest = {
    statusCode: 1200,
    uafRequest: JSON.stringify(request),
    op: op,
    lifetimeMillis: 60000
  };
  res.type("application/fido+uaf; charset=utf-8");
  res.send(returnUAFRequest);
  res.end();
  console.log(`Request sent ('${op}').`);
}

function sendStatus(res, message, statusCode, obj) {
  res.json({ statusCode: statusCode });
  console.log(message);
}
