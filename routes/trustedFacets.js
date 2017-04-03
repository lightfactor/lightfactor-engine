
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

var express = require('express');
var router = express.Router();

var dm = null;

router.use(function(req, res, next) {
    if (!dm) dm = req.app.get('dataMongo');
    next();
});

router.get('/', function(req, res, next) {

    var data = {};

    res.type("application/fido.trusted-apps+json")
    res.send({
        'trustedFacets' : [{
            'version': { 'major': 1, 'minor' : 0 },
            'ids': config.trustedFacets
        }]
    })
    res.end()
})

module.exports = router;
