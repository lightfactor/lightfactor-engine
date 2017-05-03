
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

var fs   = require('fs');
var path = require('path');

var MongoDB     = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var config      = require(path.join(__dirname, '../config'));

var started = false;
var db = null;

var challenges;
var authenticators;
var metadatas = {};


/**
 * Reads all files in the forlder
 * @param  {String} dirname          - folder location
 * @param  {Function} onFileContent  - on every file read callback
 * @param  {Function} onError        - error callback
 */
var readFiles = function(dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(path.join(dirname, filename), 'utf-8', function(err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });

}

var start = function(options, callback) {

    if (started) callback();


    MongoClient.connect(options.connectionUrl, function(error, result) {
        console.log("Connected to server.");
        db      = result;
        started = true;
        policies       = getCollection("policies");
        challenges     = getCollection("challenges");
        authenticators = getCollection("authenticators");
        callback(error);
    });

    readFiles(path.join(__dirname, '../metadata'), function(filename, content) {
        if(filename.endsWith('.json')) {
            console.log(`Loading metadata statement from file ${filename}`);
            let mds  = JSON.parse(content);
            let aaid = mds.aaid;

            if(!metadatas[aaid])
                metadatas[aaid] = [];

            metadatas[aaid].push(mds);
        } else
            console.log(`Ignoring ${filename}. JSON file must end with ".json"!`)

    }, function(error) {
        throw error;
    });

}

var stop = function() {

    if (started) {
        db.close();
        console.log("Disconnected from server.");
        started = false;
    }

}

function setPolicy(obj) {
    var promise = new Promise(function(resolve, reject) {
        /**
         * Load list of accepted AAID's from config
         * @type {Array}
         */
        let accepted = [];
        for(let aaid of Object.keys(metadatas)) {
            accepted.push([
                { "aaid" : [aaid]}
            ])
        }


        obj.policy = {
            'accepted': accepted,
            'disallowed': config.disallowed
        }

        resolve(obj)
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
        if(metadatas[query.aaid]) {
            let statement;

            for(let metadata of metadatas[query.aaid]) {
                if(statement)
                    break

                for(let upv of metadata.upv) {
                    if(upv.major === query['upv.major'] && upv.minor === query['upv.minor']) {
                        statement = metadata;
                        break
                    }
                }
            }

            if(statement) {
                obj.metadata = statement;
                resolve(obj);
            } else
                reject(`No metadata statement with version v${query['upv.major']}.${query['upv.minor']} found!`);

        } else
            reject(`No metadata statement for ${query.aaid} found!`)

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

    setPolicy: setPolicy,

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

    var collection = db.collection(collectionString);

    if (collection != null) {
        console.log("Collection found (" + collectionString + ").");
        return collection;
    }                                                                                                                                                                                        // TODO: else?
}
