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

var fs = require('fs');

var config = {
    https: {
        key: fs.readFileSync('<path to private key PEM file>'),
        cert: fs.readFileSync('<path to private cert PEM file>'),
        honorCipherOrder: true,
        NPNProtocols: ['http/1.1', 'http/1.0'],
        secureProtocol: 'TLSv1_2_method',
        /* Set to false if running with self-signed cerificates */
        rejectUnauthorized: true
    },
    mongodb: {
        // connectionUrl: 'mongodb://localhost:27017/local'
        connectionUrl: 'mongodb://user:password@host:port/database'
    },
    port: 8000
}

module.exports = config;
