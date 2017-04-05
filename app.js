
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

var https = require('https');

var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var dataMongo = require('./modules/data-mongo');

var uaf = require('./routes/uaf');
var trustedFacets = require('./routes/trustedFacets');

var config = require("./config");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', trustedFacets);
app.use('/Get', uaf);
app.use('/Send', uaf);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

app.use(function(err, req, res, next) {
    console.log(err);
    var returnMessage = {
        statusCode: 1498,
        message: err.message
    };
    if (err.details) {
        returnMessage.field = err.details[0].dataPath;
        returnMessage.info = err.details[0].message;
    }
    res.json(returnMessage);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function initialize(callback) {
    dataMongo.start(config.mongodb, function(err) {
        app.set('dataMongo', dataMongo);
        callback();
    });
}

initialize(function() {
    console.log(`Starting server on port ${config.port}`);
    var hs = require('https').Server(config.https, app);
    hs.listen(config.port);
});

module.exports = app;
