
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

var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;

var started = false;
var db = null;

var policies;
var challenges;
var metadatas;
var authenticators;


var start = function(options, callback) {

  if (started) callback();

  MongoClient.connect(options.connectionUrl, function(err, result) {
    console.log("Connected to server.");
    db = result;
    started = true;
    policies = getCollection("policies");
    challenges = getCollection("challenges");
    metadatas = getCollection("metadatas");
    authenticators = getCollection("authenticators");
    callback(err);
  });

}

var stop = function() {

  if (started) {
    db.close();
    console.log("Disconnected from server.");
    started = false;
  }

}

function findOnePolicy(query, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Searching for policy.");
    policies.find(query).toArray(function(err, policy) {
      if (err) reject(err);
      if (!(policy) || policy.length !== 1) reject(new Error("Policy search did not yield exactly one match."));
      else {
        obj.policy = policy[0].policy;
        resolve (obj);
      }
    });
  });
  return promise;
}

function findAndDeleteChallenge(query, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Searching for challenge.");
    challenges.findOneAndDelete(query, function(err, challenge) {
      if (err) reject(err);
      if (!(challenge) || !(challenge.value)) reject(new Error("No matching challenge found."));      // TODO: are both of these conditions possible, i.e., a challenge without a value?
      else {
        obj.username = challenge.value.username;
        obj.challenge = challenge.value;
        resolve (obj);
      }
    });
  });
  return promise;
}

// NOTE: the syntax for update() below sets a createdAt column so we can take advantage of MongoDB TTL feature
//        the automatic removal of expired challenges requires an index:   collection.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 60 } );
//        the TTL monitor runs every 60 seconds, so faster is not necessary (or useful)
//        the $currentDate update operator is only available then; we want system time to avoid issues with bad local time

function saveChallenge(challenge, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Saving challenge.");
    challenges.update({ challenge: challenge.challenge }, { $currentDate: { createdAt: true }, $set: challenge } , { upsert: true }, function(err, result) {
      if (err) reject(err);
      resolve(obj);
    });
  });
  return promise;
}

function findExactlyOneMetadata(query, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Searching for metadata.");
    console.log(query);
    metadatas.find(query).toArray(function(err, metadata) {
      if (err) reject(err);
      if (!(metadata) || metadata.length !== 1) reject(new Error("Metadata search did not yield exactly one match."));
      else {
        obj.metadata = metadata[0];
        resolve (obj);
      }
    });
  });
  return promise;
}

// NOTES:
//  use a query of { $a: "" } to trigger an error
//  devices.find({ _id: dm.toObjectId("57a8a0e0b95d8a2648bdb5ef") }).limit(1).next()
function findAuthenticators(query, modifier, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Searching for authenticators.");
    console.log(query);
    authenticators.find(query, modifier).toArray(function(err, authenticatorArray) {
      if (err) reject(err);
//      if (devices.length === 0) reject(new Error("No matching authenticators found."));
      obj.authenticators = authenticatorArray;
      resolve(obj);
    });
  });
  return promise;
}

function updateAuthenticator(query, update, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Updating authenticator.");
    authenticators.update(query, update, function(err, result) {
      if (err) reject(err);
      resolve(obj);
    });
  });
  return promise;
}

function saveAuthenticator(authenticator, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Creating registration.");
    authenticators.insertOne(authenticator, { j: true }, function(err, result) {
      if (err) reject(err);
      resolve(obj);
    });
  });
  return promise;
}

function deleteAuthenticators(query, obj) {
  var promise = new Promise(function(resolve, reject) {
    console.log("Deleting authenticators.");
    authenticators.deleteMany(query, function(err, result) {
      if (err) reject(err);
      resolve(obj);
    });
  });
  return promise;
}


module.exports = {

  start: start,
  stop: stop,

  findOnePolicy: findOnePolicy,

  findAndDeleteChallenge: findAndDeleteChallenge,
  saveChallenge: saveChallenge,

  findExactlyOneMetadata: findExactlyOneMetadata,

  findAuthenticators: findAuthenticators,
  updateAuthenticator: updateAuthenticator,
  saveAuthenticator: saveAuthenticator,
  deleteAuthenticators: deleteAuthenticators

}

var toObjectId = function(oid) {                                                            // a 24 byte hex string, 12 byte binary string, or a Number

  return MongoDB.ObjectId(oid);

}

var getCollection = function(collectionString) {

  var   collection = db.collection(collectionString);

  if (collection != null) {
    console.log("Collection found (" + collectionString + ").");
    return collection;
  }
                                                                                            // TODO: else?
}
