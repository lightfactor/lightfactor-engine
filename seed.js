
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

var config = require("./config");

var db = {};
var promiseArray = [];

MongoClient.connect(config.mongodb.connectionUrl, function(err, result) {

  console.log("Connected to server.");

  db = result;

  for (collectionName of ["facets", "policies", "metadatas", "challenges"]) {
    promiseArray.push(doCollection(collectionName));
  }

  Promise.all(promiseArray)
    .then(values => {
      console.log("Server seeded.");
    })
    .catch(function(e) {
      console.log(`Server not seeded: ${e}`);
    })
  ;

  db.close();

});

function doCollection(collectionName) {

  var collection = db.collection(collectionName);
  var collectionData = require(`./db/${collectionName}`);

  console.log(`Seeding collection ${collectionName}.`);

  if (collectionData.indexes) promiseArray.push(collection.createIndexes(collectionData.indexes));

  if (collectionData.objects) promiseArray.push(collection.insertMany(collectionData.objects, { j: true }));

}
